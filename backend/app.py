from flask import Flask, request, jsonify, make_response
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, TypedDict, Union
import os
import uuid
from dotenv import load_dotenv
from cosmos_db import CosmosDBManager
import humps
import traceback

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize rate limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Initialize CosmosDB manager
cosmos_db = CosmosDBManager()

class ApiResponse(TypedDict):
    success: bool
    data: Optional[Dict[str, Any]]
    error: Optional[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]]

def create_api_response(
    success: bool,
    data: Optional[Dict[str, Any]] = None,
    error: Optional[Dict[str, Any]] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> ApiResponse:
    """Create a standardized API response following the design document format."""
    response: ApiResponse = {
        "success": success,
        "data": data,
        "error": error,
        "metadata": {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "requestId": request.headers.get("X-Request-ID", ""),
            **(metadata or {})
        }
    }
    return response

def add_rate_limit_headers(response):
    """Add rate limit headers to the response."""
    if hasattr(request, "view_rate_limit"):
        window_stats = getattr(request, "view_rate_limit")
        response.headers.add(
            "X-RateLimit-Limit",
            str(window_stats.limit)
        )
        response.headers.add(
            "X-RateLimit-Remaining",
            str(window_stats.remaining)
        )
        response.headers.add(
            "X-RateLimit-Reset",
            str(window_stats.reset)
        )
    return response

def snake_to_camel(data: Union[Dict, List]) -> Union[Dict, List]:
    """Convert snake_case keys to camelCase for frontend consumption."""
    return humps.camelize(data)

def camel_to_snake(data: Union[Dict, List]) -> Union[Dict, List]:
    """Convert camelCase keys to snake_case for backend storage."""
    return humps.decamelize(data)

@app.errorhandler(Exception)
def handle_error(error: Exception) -> tuple[Dict[str, Any], int]:
    """Global error handler to ensure consistent error responses."""
    if hasattr(error, "code") and hasattr(error, "description"):
        # Handle Flask/HTTP errors
        status_code = error.code
        error_message = error.description
    else:
        # Handle other exceptions
        status_code = 500
        error_message = str(error)

    app.logger.error(f"Error: {error}")
    app.logger.error(traceback.format_exc())

    response = create_api_response(
        success=False,
        error={
            "code": status_code,
            "message": error_message
        }
    )
    return jsonify(response), status_code

@app.route("/api/v1/user-data", methods=["GET"])
@limiter.limit("60 per hour")
def get_user_data():
    """
    Get all data for a user (tasks, goals, categories, dashboard).
    Rate limit: 60 requests per hour
    """
    try:
        # Get user_id from auth token (placeholder - implement actual auth)
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            raise ValueError("User ID is required")

        # Query all user data from Cosmos DB
        query = """
        SELECT * FROM c 
        WHERE c.user_id = @user_id
        """
        items = cosmos_db.query_items(
            query=query,
            parameters=[{"name": "@user_id", "value": user_id}],
            partition_key=user_id
        )

        # Organize items by type
        tasks = {}
        goals = {}
        categories = {}
        dashboard = None

        for item in items:
            item_type = item.get("type")
            if item_type == "task":
                tasks[item["id"]] = item
            elif item_type == "goal":
                goals[item["id"]] = item
            elif item_type == "category":
                categories[item["id"]] = item
            elif item_type == "dashboard":
                dashboard = item

        # Create response data
        response_data = {
            "tasks": snake_to_camel(tasks),
            "goals": snake_to_camel(goals),
            "categories": snake_to_camel(categories),
            "dashboard": snake_to_camel(dashboard) if dashboard else None,
            "lastSyncedAt": datetime.now(timezone.utc).isoformat()
        }

        response = make_response(jsonify(create_api_response(success=True, data=response_data)))
        return add_rate_limit_headers(response)

    except Exception as e:
        raise

@app.route("/api/v1/sync", methods=["POST"])
@limiter.limit("120 per minute")
def sync_changes():
    """
    Sync changes between frontend and backend.
    Rate limit: 120 requests per minute
    """
    try:
        # Get user_id from auth token (placeholder - implement actual auth)
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            raise ValueError("User ID is required")

        # Get request data
        data = request.get_json()
        if not data:
            raise ValueError("Request body is required")

        changes = data.get("changes", [])
        client_last_sync = data.get("clientLastSync")

        if not client_last_sync:
            raise ValueError("clientLastSync is required")

        # Process each change
        server_changes = []
        for change in changes:
            change_type = change.get("type")
            operation = change.get("operation")
            item_id = change.get("id")
            item_data = camel_to_snake(change.get("data", {}))
            timestamp = change.get("timestamp")

            # Ensure required fields
            if not all([change_type, operation, timestamp]):
                raise ValueError("Invalid change object")

            # Add user_id to item_data
            if item_data:
                item_data["user_id"] = user_id
                item_data["type"] = change_type
                item_data["updated_at"] = datetime.now(timezone.utc).isoformat()

            try:
                if operation == "create":
                    if not item_data:
                        raise ValueError("Data is required for create operation")
                    item_data["id"] = item_id or str(uuid.uuid4())
                    item_data["created_at"] = datetime.now(timezone.utc).isoformat()
                    result = cosmos_db.create_item(item_data)
                    if result:
                        server_changes.append({
                            "type": change_type,
                            "operation": "create",
                            "id": result["id"],
                            "data": snake_to_camel(result),
                            "timestamp": result["updated_at"]
                        })

                elif operation == "update":
                    if not item_id:
                        raise ValueError("Item ID is required for update operation")
                    result = cosmos_db.update_item(item_id, item_data)
                    if result:
                        server_changes.append({
                            "type": change_type,
                            "operation": "update",
                            "id": result["id"],
                            "data": snake_to_camel(result),
                            "timestamp": result["updated_at"]
                        })

                elif operation == "delete":
                    if not item_id:
                        raise ValueError("Item ID is required for delete operation")
                    if cosmos_db.delete_item(item_id, user_id):
                        server_changes.append({
                            "type": change_type,
                            "operation": "delete",
                            "id": item_id,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

            except Exception as operation_error:
                app.logger.error(f"Error processing change: {operation_error}")
                app.logger.error(traceback.format_exc())
                # Continue processing other changes
                continue

        # Query for any server-side changes newer than client_last_sync
        query = """
        SELECT * FROM c 
        WHERE c.user_id = @user_id 
        AND c.updated_at > @client_last_sync
        """
        server_items = cosmos_db.query_items(
            query=query,
            parameters=[
                {"name": "@user_id", "value": user_id},
                {"name": "@client_last_sync", "value": client_last_sync}
            ],
            partition_key=user_id
        )

        # Add server items to server_changes if they're not already included
        processed_ids = {change["id"] for change in server_changes}
        for item in server_items:
            if item["id"] not in processed_ids:
                server_changes.append({
                    "type": item["type"],
                    "operation": "update",
                    "id": item["id"],
                    "data": snake_to_camel(item),
                    "timestamp": item["updated_at"]
                })

        response_data = {
            "serverChanges": server_changes,
            "syncedAt": datetime.now(timezone.utc).isoformat()
        }

        response = make_response(jsonify(create_api_response(success=True, data=response_data)))
        return add_rate_limit_headers(response)

    except Exception as e:
        raise

if __name__ == "__main__":
    app.run(debug=True)
