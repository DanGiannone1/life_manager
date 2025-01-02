from flask import Flask, request, jsonify
from flask_cors import CORS
from cosmos_db import CosmosDBManager
import hashlib
import secrets
from datetime import datetime, timezone
import uuid

import re
import json


app = Flask(__name__)
CORS(app)

# Initialize CosmosDB manager
cosmos_db = CosmosDBManager()

# Status mapping for display
STATUS_MAP = {
    'not_started': 'Not Started',
    'working_on_it': 'Working On It',
    'complete': 'Complete'
}

def to_snake_case(data: dict) -> dict:
    """Convert a dictionary's keys from camelCase to snake_case recursively."""
    if not isinstance(data, dict):
        return data

    new_dict = {}
    for key, value in data.items():
        # Convert key from camelCase to snake_case
        snake_key = re.sub('([a-z0-9])([A-Z])', r'\1_\2', key).lower()
        
        # Handle nested dictionaries and lists
        if isinstance(value, dict):
            new_dict[snake_key] = to_snake_case(value)
        elif isinstance(value, list):
            new_dict[snake_key] = [to_snake_case(item) if isinstance(item, dict) else item for item in value]
        else:
            new_dict[snake_key] = value
            
    return new_dict

def to_camel_case(data: dict) -> dict:
    """Convert a dictionary's keys from snake_case to camelCase recursively."""
    if not isinstance(data, dict):
        return data

    new_dict = {}
    for key, value in data.items():
        # Convert key from snake_case to camelCase
        components = key.split('_')
        camel_key = components[0] + ''.join(x.title() for x in components[1:])
        
        # Handle nested dictionaries and lists
        if isinstance(value, dict):
            new_dict[camel_key] = to_camel_case(value)
        elif isinstance(value, list):
            new_dict[camel_key] = [to_camel_case(item) if isinstance(item, dict) else item for item in value]
        else:
            new_dict[camel_key] = value
            
    return new_dict

def generate_hash_id(user_id: str, title: str, timestamp: str) -> str:
    """
    Generate a unique hash ID from user_id, title, and timestamp.
    
    Args:
        user_id: The user's ID
        title: The item's title
        timestamp: ISO format timestamp with second precision
    
    Returns:
        A 23-character string containing a hash and salt
    """
    if not all([user_id, title, timestamp]):
        raise ValueError("Missing required parameters for hash generation")

    # Add a 4-character random salt for extra uniqueness
    salt = secrets.token_hex(2)  # 2 bytes = 4 hex characters
    
    # Sanitize inputs (remove whitespace and normalize)
    user_id = user_id.strip()
    title = title.strip()
    
    # Combine elements for hashing
    combined = f"{user_id}::{title}::{timestamp}::{salt}"
    
    # Create SHA-256 hash
    hash_object = hashlib.sha256(combined.encode('utf-8'))
    # Get first 19 chars of the hex digest
    short_hash = hash_object.hexdigest()[:19]
    
    # Format: [hash]_[salt] (23 characters total)
    return f"{short_hash}_{salt}"

@app.route('/api/create-item', methods=['POST'])
def create_item():
    try:
        data = to_snake_case(request.json)
        
        # Validate required fields
        required_fields = ['title', 'user_id', 'type']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
            
        if data['type'] not in ['task', 'goal']:
            return jsonify({'error': 'Invalid type'}), 400

        # Validate and convert status
        status = data.get('status', 'not_started').lower().replace(' ', '_')
        valid_statuses = ['not_started', 'working_on_it', 'complete']
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status value. Must be one of: {", ".join(valid_statuses)}'}), 400

        # Validate and map priority (0-100 scale)
        priority_map = {
            'Very High': 90,
            'High': 70,
            'Medium': 50,
            'Low': 30,
            'Very Low': 10
        }
        priority = data.get('priority', 'Medium')
        if priority not in priority_map:
            return jsonify({'error': f'Invalid priority value. Must be one of: {", ".join(priority_map.keys())}'}), 400
            
        # Get current timestamp in ISO format with second precision
        current_time = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        
        # Generate hash ID
        try:
            hash_id = generate_hash_id(
                user_id=data['user_id'],
                title=data['title'],
                timestamp=current_time
            )
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
            
        # Add type prefix
        type_prefix = 't' if data['type'] == 'task' else 'g'
        item_id = f"{type_prefix}_{hash_id}"
        
        # Create the base item structure
        item = {
            'id': item_id,
            'user_id': data['user_id'],  # This should come from authentication in production
            'type': data['type'],  # 'task' or 'goal'
            'title': data['title'],
            'status': status,
            'priority': priority_map[priority],  # 0-100 scale
            'dynamic_priority': priority_map[priority],  # Initially same as priority
            'notes': data.get('notes'),
            'due_date': data.get('due_date'),
            'created_at': current_time,
            'updated_at': current_time,
            'category_id': data.get('category_id'),
            'subcategory_id': data.get('subcategory_id'),
            'is_recurring': data.get('is_recurring', False),
            'frequency_in_days': data.get('frequency_in_days'),
            'completion_history': []
        }
        
        # Add type-specific fields
        if data['type'] == 'task':
            item.update({
                'goal_ids': data.get('goal_ids', [])
            })
        elif data['type'] == 'goal':
            item.update({
                'target_date': data.get('target_date'),
                'associated_task_ids': data.get('associated_task_ids', [])
            })
        
        # Create the item in CosmosDB
        created_item = cosmos_db.create_item(item)
        
        if created_item:
            return jsonify({'message': 'Item created successfully'}), 201
        else:
            return jsonify({'error': 'Failed to create item'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/get-master-list', methods=['GET'])
def get_master_list():
    try:
        # For now, we'll just get all items for the test user
        # In production, this would come from authentication
        user_id = 'test-user'
        
        # Get filter parameters
        statuses = request.args.get('statuses', '').split(',') if request.args.get('statuses') else None
        sort_by = request.args.get('sortBy', 'priority')
        sort_direction = request.args.get('sortDirection', 'asc')
        item_type = request.args.get('type')
        
        # Build the query
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        params = [{"name": "@user_id", "value": user_id}]
        
        # Add type filter if specified
        if item_type:
            query += " AND c.type = @type"
            params.append({"name": "@type", "value": item_type})
            
        # Add status filter if specified
        if statuses and len(statuses) > 0 and not (len(statuses) == 1 and statuses[0] == ''):
            # Convert display status to storage status
            status_map = {
                'Not Started': 'not_started',
                'Working On It': 'working_on_it',
                'Complete': 'complete'
            }
            status_conditions = []
            for i, status in enumerate(statuses):
                param_name = f"@status{i}"
                status_conditions.append(f"c.status = {param_name}")
                params.append({"name": param_name, "value": status_map.get(status, status.lower().replace(' ', '_'))})
            query += f" AND ({' OR '.join(status_conditions)})"
            
        # Add sorting
        sort_field = {
            'priority': 'c.priority',  # Using raw priority number now
            'dueDate': 'c.due_date',
            'createdAt': 'c.created_at'
        }.get(sort_by, 'c.priority')
        
        # For priority, we want asc to mean highest priority first (90 = Very High)
        if sort_by == 'priority':
            sort_direction = 'asc' if sort_direction == 'desc' else 'desc'
            
        query += f" ORDER BY {sort_field} {sort_direction.upper()}"
        
        # Query items from CosmosDB
        items = cosmos_db.query_items(query, params, partition_key=user_id)
        
        if items is None:
            return jsonify([]), 200
            
        # Priority mapping for display
        priority_map = {
            90: 'Very High',
            70: 'High',
            50: 'Medium',
            30: 'Low',
            10: 'Very Low'
        }
        
        response_items = []
        for item in items:
            camel_item = to_camel_case(item)
            camel_item['displayPriority'] = priority_map.get(item['priority'], 'Medium')
            camel_item['status'] = STATUS_MAP.get(item['status'], item['status'])
            response_items.append(camel_item)
            
        return jsonify(response_items), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/batch-update', methods=['PATCH'])
def batch_update():
    try:
        data = to_snake_case(request.json)
        if not data.get('updates'):
            return jsonify({'error': 'No updates provided'}), 400

        # Validate batch size
        if len(data['updates']) > 100:
            return jsonify({'error': 'Maximum batch size is 100 items'}), 400

        # Reverse status mapping for storage
        REVERSE_STATUS_MAP = {
            'Not Started': 'not_started',
            'Working On It': 'working_on_it',
            'Complete': 'complete'
        }

        priority_map = {
            'Very High': 90,
            'High': 70,
            'Medium': 50,
            'Low': 30,
            'Very Low': 10
        }
        
        current_time = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

        for update in data['updates']:
            item_id = update.get('id')
            if not item_id:
                continue

            # Convert status from display format to storage format
            if 'status' in update:
                display_status = update['status']
                storage_status = REVERSE_STATUS_MAP.get(display_status)
                if not storage_status:
                    return jsonify({'error': f'Invalid status value for item {item_id}. Must be one of: {", ".join(REVERSE_STATUS_MAP.keys())}'}, 400)
                update['status'] = storage_status

            # Handle priority if it's being updated
            if 'priority' in update:
                display_priority = update['priority']
                if display_priority not in priority_map:
                    return jsonify({'error': f'Invalid priority value for item {item_id}. Must be one of: {", ".join(priority_map.keys())}'}, 400)
                update['priority'] = priority_map[display_priority]

            # Add updated_at timestamp
            update['updated_at'] = current_time
            
            # Update the item in CosmosDB
            if not cosmos_db.update_item(item_id, update):
                return jsonify({'error': f'Failed to update item {item_id}'}), 400

        return jsonify({'message': 'Items updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id: str):
    try:
        # For now, hardcode test-user
        user_id = 'test-user'
        
        # Delete the item
        success = cosmos_db.delete_item(item_id, user_id)
        
        if success:
            return jsonify({'message': 'Item deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete item'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
