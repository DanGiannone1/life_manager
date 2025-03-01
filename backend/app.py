from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Dict, Any, List, Optional, TypedDict, Union
from pydantic import BaseModel, Field, validator
from datetime import datetime, timezone
import os
import uuid
from dotenv import load_dotenv
from cosmos_db import CosmosDBManager
import humps
import traceback
import json
from urllib.parse import quote

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Life Manager API", 
              description="API for Life Manager application",
              version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Initialize CosmosDB manager
cosmos_db = CosmosDBManager()

# Pydantic models for request/response data validation
class ErrorDetail(BaseModel):
    code: int
    message: str

class MetadataModel(BaseModel):
    timestamp: str
    requestId: str = ""
    
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[ErrorDetail] = None
    metadata: MetadataModel

# Common data models
class ChangeItem(BaseModel):
    type: str
    operation: str
    id: str
    data: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class SyncRequest(BaseModel):
    changes: List[ChangeItem]
    clientLastSync: str

class SyncResponse(BaseModel):
    serverChanges: List[ChangeItem]
    syncedAt: str

# Fields that need case conversion for their values
CASE_CONVERTIBLE_FIELDS = ["status"]  # Add more fields as needed

def convert_case(value: str, to_camel: bool) -> str:
    """Convert a string between snake_case and camelCase."""
    if to_camel:
        return humps.camelize(value)
    return humps.decamelize(value)

def convert_enum_values(data: Union[Dict, List], is_snake_to_camel: bool) -> Union[Dict, List]:
    """Convert enumerated values between snake_case and camelCase."""
    if isinstance(data, list):
        return [convert_enum_values(item, is_snake_to_camel) for item in data]
    
    if not isinstance(data, dict):
        return data
    
    result = {}
    for key, value in data.items():
        if isinstance(value, (dict, list)):
            value = convert_enum_values(value, is_snake_to_camel)
        elif isinstance(value, str) and key in CASE_CONVERTIBLE_FIELDS:
            value = convert_case(value, is_snake_to_camel)
        result[key] = value
    return result

def snake_to_camel(data: Union[Dict, List]) -> Union[Dict, List]:
    """Convert snake_case keys to camelCase and convert enumerated values."""
    # First convert the enum values
    data = convert_enum_values(data, is_snake_to_camel=True)
    # Then convert the keys
    return humps.camelize(data)

def camel_to_snake(data: Union[Dict, List]) -> Union[Dict, List]:
    """Convert camelCase keys to snake_case and convert enumerated values."""
    # First convert the keys
    data = humps.decamelize(data)
    # Then convert the enum values
    return convert_enum_values(data, is_snake_to_camel=False)

def create_api_response(
    success: bool,
    data: Optional[Dict[str, Any]] = None,
    error: Optional[Dict[str, Any]] = None,
    request: Request = None,
) -> Dict:
    """Create a standardized API response following the design document format."""
    request_id = request.headers.get("X-Request-ID", "") if request else ""
    
    metadata = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "requestId": request_id,
    }
    
    error_detail = None
    if error:
        error_detail = ErrorDetail(**error)
    
    response = {
        "success": success,
        "data": data,
        "error": error_detail.dict() if error_detail else None,
        "metadata": metadata
    }
    return response

async def add_rate_limit_headers(request: Request, response: Response):
    """Add rate limit headers to the response."""
    if hasattr(request.state, "view_rate_limit"):
        window_stats = request.state.view_rate_limit
        # Handle the case where window_stats is a tuple (limit, remaining, reset)
        if isinstance(window_stats, tuple) and len(window_stats) >= 3:
            response.headers["X-RateLimit-Limit"] = str(window_stats[0])
            response.headers["X-RateLimit-Remaining"] = str(window_stats[1])
            response.headers["X-RateLimit-Reset"] = str(window_stats[2])
        # Original behavior for object with attributes
        elif hasattr(window_stats, "limit"):
            response.headers["X-RateLimit-Limit"] = str(window_stats.limit)
            response.headers["X-RateLimit-Remaining"] = str(window_stats.remaining)
            response.headers["X-RateLimit-Reset"] = str(window_stats.reset)
    return response

# Exception handler
@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    """Global error handler to ensure consistent error responses."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    error_message = str(exc)
    
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        error_message = exc.detail
    
    print(f"Error: {exc}")
    print(traceback.format_exc())
    
    response = create_api_response(
        success=False,
        error={
            "code": status_code,
            "message": error_message
        },
        request=request
    )
    
    return JSONResponse(
        status_code=status_code,
        content=response
    )

# Dependency to get user ID
async def get_user_id(request: Request) -> str:
    """Get user ID from request headers or use a default test ID."""
    user_id = request.headers.get("X-User-ID", "test-user")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID is required"
        )
    return user_id

# API Routes
@app.get("/api/v1/user-data", response_model=ApiResponse)
@limiter.limit("180/hour")
async def get_user_data(request: Request, user_id: str = Depends(get_user_id)):
    """
    Get all data for a user (tasks, goals, categories, dashboard).
    Rate limit: 180 requests per hour
    """
    try:
        print(f"Fetching user data for user_id: {user_id}")
        # Get all user data using the new get_user_data method
        user_data = cosmos_db.get_user_data(user_id)

        # Convert to camelCase for frontend
        response_data = {
            "tasks": snake_to_camel(user_data["tasks"]),
            "goals": snake_to_camel(user_data["goals"]),
            "categories": snake_to_camel(user_data["categories"]),
            "dashboard": snake_to_camel(user_data["dashboard"]) if user_data["dashboard"] else None,
            "lastSyncedAt": datetime.now(timezone.utc).isoformat()
        }

        api_response = create_api_response(success=True, data=response_data, request=request)
        response = JSONResponse(content=api_response)
        await add_rate_limit_headers(request, response)
        return response

    except Exception as e:
        raise

@app.post("/api/v1/sync", response_model=ApiResponse)
@limiter.limit("360/minute")
async def sync_changes(
    request: Request, 
    sync_request: SyncRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Sync changes between frontend and backend.
    Rate limit: 360 requests per minute
    """
    try:
        # Process each change
        server_changes = []
        has_errors = False

        for change in sync_request.changes:
            change_type = change.type
            operation = change.operation
            item_id = change.id
            # Convert the data while preserving all fields, including None values
            item_data = camel_to_snake(change.data) if change.data is not None else {}

            if item_data is not None:
                item_data["user_id"] = user_id
                item_data["type"] = change_type
                item_data["updated_at"] = datetime.now(timezone.utc).isoformat()

            try:
                if operation == "create":
                    if not item_data:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Data is required for create operation"
                        )
                    item_data["id"] = item_id or str(uuid.uuid4())
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
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Item ID is required for update operation"
                        )
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
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Item ID is required for delete operation"
                        )
                    if cosmos_db.delete_item(item_id, user_id):
                        server_changes.append({
                            "type": change_type,
                            "operation": "delete",
                            "id": item_id,
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        })

            except Exception as operation_error:
                print(f"Error processing change: {operation_error}")
                print(traceback.format_exc())
                has_errors = True
                error_response = create_api_response(
                    success=False,
                    error={"code": 500, "message": str(operation_error)},
                    data={"serverChanges": server_changes},
                    request=request
                )
                response = JSONResponse(content=error_response, status_code=500)
                await add_rate_limit_headers(request, response)
                return response

        # Only proceed with server changes if no errors occurred
        if not has_errors:
            # Get any server-side changes newer than client_last_sync
            server_items = cosmos_db.get_changes_since(user_id, sync_request.clientLastSync)

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

            api_response = create_api_response(success=True, data=response_data, request=request)
            response = JSONResponse(content=api_response)
            await add_rate_limit_headers(request, response)
            return response

    except Exception as e:
        print(f"Unexpected error in sync: {e}")
        print(traceback.format_exc())
        raise

# Serve static files from the frontend build directory
if os.path.isdir("dist"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")
    
    @app.get("/", include_in_schema=False)
    async def serve_frontend_index():
        return FileResponse("dist/index.html")
    
    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend_paths(path: str):
        # Check if path exists as a file in the dist directory
        file_path = f"dist/{path}"
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise return index.html for client-side routing
        return FileResponse("dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 