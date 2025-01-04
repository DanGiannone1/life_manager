# File: backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from cosmos_db import CosmosDBManager
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
import uuid
import re
import json
import traceback

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
        snake_key = re.sub('([a-z0-9])([A-Z])', r'\1_\2', key).lower()
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
        components = key.split('_')
        camel_key = components[0] + ''.join(x.title() for x in components[1:])
        
        if isinstance(value, dict):
            new_dict[camel_key] = to_camel_case(value)
        elif isinstance(value, list):
            new_dict[camel_key] = [to_camel_case(item) if isinstance(item, dict) else item for item in value]
        else:
            new_dict[camel_key] = value
    return new_dict

def generate_hash_id(user_id: str, title: str, timestamp: str) -> str:
    if not all([user_id, title, timestamp]):
        raise ValueError("Missing required parameters for hash generation")
    salt = secrets.token_hex(2)  # 2 bytes = 4 hex characters
    user_id = user_id.strip()
    title = title.strip()
    combined = f"{user_id}::{title}::{timestamp}::{salt}"
    hash_object = hashlib.sha256(combined.encode('utf-8'))
    short_hash = hash_object.hexdigest()[:19]
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
        
        current_time = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        try:
            hash_id = generate_hash_id(
                user_id=data['user_id'],
                title=data['title'],
                timestamp=current_time
            )
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

        type_prefix = 't' if data['type'] == 'task' else 'g'
        item_id = f"{type_prefix}_{hash_id}"

        item = {
            'id': item_id,
            'user_id': data['user_id'],
            'type': data['type'],
            'title': data['title'],
            'status': status,
            'priority': priority_map[priority],
            'dynamic_priority': priority_map[priority],
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

        # Type-specific fields
        if data['type'] == 'task':
            item['goal_ids'] = data.get('goal_ids', [])
        else:
            item['target_date'] = data.get('target_date')
            item['associated_task_ids'] = data.get('associated_task_ids', [])

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
        # Hardcode for test user
        user_id = 'test-user'
        
        statuses = request.args.get('statuses', '').split(',') if request.args.get('statuses') else None
        sort_by = request.args.get('sortBy', 'priority')
        sort_direction = request.args.get('sortDirection', 'asc')
        item_type = request.args.get('type')

        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        params = [{"name": "@user_id", "value": user_id}]
        
        if item_type:
            query += " AND c.type = @type"
            params.append({"name": "@type", "value": item_type})
        
        if statuses and len(statuses) > 0 and not (len(statuses) == 1 and statuses[0] == ''):
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

        sort_field = {
            'priority': 'c.priority',
            'dueDate': 'c.due_date',
            'createdAt': 'c.created_at'
        }.get(sort_by, 'c.priority')

        # For priority, we want asc to mean highest priority first (so invert if sort_by=priority)
        if sort_by == 'priority':
            sort_direction = 'asc' if sort_direction == 'desc' else 'desc'
        query += f" ORDER BY {sort_field} {sort_direction.upper()}"

        items = cosmos_db.query_items(query, params, partition_key=user_id)
        if items is None:
            return jsonify([]), 200

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
        print("\n=== Batch Update Request ===")
        print(f"Request JSON: {request.json}")
        
        data = to_snake_case(request.json)
        print(f"\nAfter snake_case conversion: {data}")
        
        if not data.get('updates'):
            return jsonify({'error': 'No updates provided'}), 400

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
            try:
                item_id = update.get('id')
                print(f"\nProcessing update for item {item_id}")
                print(f"Update data: {update}")
                
                if not item_id:
                    continue

                # Convert status from display format to storage format
                if 'status' in update:
                    display_status = update['status']
                    print(f"Converting status from '{display_status}'")
                    storage_status = REVERSE_STATUS_MAP.get(display_status)
                    if not storage_status:
                        error_msg = f'Invalid status value "{display_status}" for item {item_id}. Must be one of: {", ".join(REVERSE_STATUS_MAP.keys())}'
                        print(f"ERROR: {error_msg}")
                        return jsonify({'error': error_msg}), 400
                    update['status'] = storage_status
                    print(f"Converted status to '{storage_status}'")

                # Handle priority
                if 'priority' in update:
                    display_priority = update['priority']
                    if display_priority not in priority_map:
                        return jsonify({
                            'error': f'Invalid priority value for item {item_id}. Must be one of: {", ".join(priority_map.keys())}'
                        }), 400
                    update['priority'] = priority_map[display_priority]

                # Always update updated_at
                update['updated_at'] = current_time

                # --------------------------
                # RECURRING TASK LOGIC HERE
                # --------------------------
                # 1. Retrieve existing item from DB to check is_recurring, frequency, etc.
                print(f"\nRetrieving existing item {item_id} from DB")
                existing_item = cosmos_db.get_item_by_id(item_id)
                if not existing_item:
                    error_msg = f'Item {item_id} not found'
                    print(f"ERROR: {error_msg}")
                    return jsonify({'error': error_msg}), 404

                print(f"Retrieved item: {existing_item}")
                print(f"Is recurring: {existing_item.get('is_recurring')}")
                print(f"Current status: {update.get('status', '')}")

                # 2. If the new status is 'complete' and it's a recurring task, override accordingly
                if update.get('status', '').lower() == 'complete' and existing_item.get('is_recurring') is True:
                    try:
                        print("\nProcessing recurring task completion")
                        # Create a copy of the existing item to modify
                        updated_item = existing_item.copy()
                        
                        # (A) Initialize completion_history if it doesn't exist
                        if 'completion_history' not in updated_item:
                            updated_item['completion_history'] = []
                        
                        # Add the new completion
                        updated_item['completion_history'].append({
                            'completed_at': current_time
                        })
                        
                        # (B) Force status back to 'not_started'
                        updated_item['status'] = 'not_started'
                        
                        # (C) Compute new due_date (only if frequency_in_days is valid)
                        freq = updated_item.get('frequency_in_days') or 0
                        if freq > 0:
                            new_due = datetime.now(timezone.utc) + timedelta(days=freq)
                            updated_item['due_date'] = new_due.replace(microsecond=0).isoformat()
                        
                        # Update the updated_at timestamp
                        updated_item['updated_at'] = current_time
                        
                        print(f"\nAttempting to upsert recurring item: {updated_item}")
                        # Now perform the actual update in Cosmos with the complete item
                        result = cosmos_db.upsert_item(updated_item)
                        if not result:
                            error_msg = f'Failed to update recurring item {item_id}'
                            print(f"ERROR: {error_msg}")
                            raise ValueError(error_msg)
                            
                        print("Successfully processed recurring task completion")
                        continue  # Skip the normal update path since we've handled it specially
                    except Exception as e:
                        error_msg = f'Error updating recurring item {item_id}: {str(e)}\n{traceback.format_exc()}'
                        print(f"ERROR: {error_msg}")
                        return jsonify({'error': error_msg}), 400

                # Now perform the actual update in Cosmos
                print(f"\nPerforming normal update for item {item_id}")
                result = cosmos_db.update_item(item_id, update)
                if not result:
                    error_msg = f'Failed to update item {item_id}'
                    print(f"ERROR: {error_msg}")
                    return jsonify({'error': error_msg}), 400

            except Exception as e:
                error_msg = f'Error processing item {item_id}: {str(e)}\n{traceback.format_exc()}'
                print(f"ERROR: {error_msg}")
                return jsonify({'error': error_msg}), 400

        return jsonify({'message': 'Items updated successfully'}), 200
    except Exception as e:
        error_msg = f'Error in batch update: {str(e)}\n{traceback.format_exc()}'
        print(f"ERROR: {error_msg}")
        return jsonify({'error': error_msg}), 400

@app.route('/api/items/<item_id>', methods=['DELETE'])
def delete_item(item_id: str):
    try:
        user_id = 'test-user'
        success = cosmos_db.delete_item(item_id, user_id)
        if success:
            return jsonify({'message': 'Item deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete item'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
