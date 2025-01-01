from flask import Flask, request, jsonify
from flask_cors import CORS
from cosmos_db import CosmosDBManager
import hashlib
import secrets
from datetime import datetime, timezone
import uuid

app = Flask(__name__)
CORS(app)

# Initialize CosmosDB manager
cosmos_db = CosmosDBManager()

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
        data = request.json
        if not data.get('title') or not data.get('userId') or not data.get('type'):
            return jsonify({'error': 'Missing required fields: title, userId, or type'}), 400
            
        if data['type'] not in ['task', 'goal']:
            return jsonify({'error': 'Invalid type'}), 400

        # Validate priority and map to numeric value
        valid_priorities = ['Very High', 'High', 'Medium', 'Low', 'Very Low']
        priority_map = {
            'Very High': 1,
            'High': 2,
            'Medium': 3,
            'Low': 4,
            'Very Low': 5
        }
        priority = data.get('priority', 'Medium')
        if priority not in valid_priorities:
            return jsonify({'error': f'Invalid priority value. Must be one of: {", ".join(valid_priorities)}'}), 400
            
        # Get current timestamp in ISO format with second precision
        current_time = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
        
        # Generate hash ID
        try:
            hash_id = generate_hash_id(
                user_id=data['userId'],
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
            'userId': data.get('userId'),  # This should come from authentication in production
            'type': data.get('type'),  # 'task' or 'goal'
            'title': data.get('title'),
            'categoryId': data.get('categoryId'),
            'subcategoryId': data.get('subcategoryId'),
            'priority': priority,
            'priorityValue': priority_map[priority],  # Numeric value for sorting
            'status': 'Not Started',
            'notes': data.get('notes'),
            'createdAt': current_time,
            'updatedAt': current_time,
            'partitionKey': data.get('userId')  # Required by CosmosDB
        }
        
        # Add type-specific fields
        if data.get('type') == 'task':
            item.update({
                'focusAreaId': data.get('focusAreaId'),
                'isRecurring': data.get('isRecurring', False),
                'frequencyInDays': data.get('frequencyInDays'),
                'dueDate': data.get('dueDate'),
                'completionHistory': []
            })
        elif data.get('type') == 'goal':
            item.update({
                'description': data.get('description', ''),
                'associatedTaskIds': []
            })
        
        # Create the item in CosmosDB
        created_item = cosmos_db.create_item(item)
        
        if created_item:
            return jsonify(created_item), 201
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
        query = "SELECT * FROM c WHERE c.userId = @userId"
        params = [{"name": "@userId", "value": user_id}]
        
        # Add type filter if specified
        if item_type:
            query += " AND c.type = @type"
            params.append({"name": "@type", "value": item_type})
            
        # Add status filter if specified
        if statuses and len(statuses) > 0 and not (len(statuses) == 1 and statuses[0] == ''):
            status_conditions = []
            for i, status in enumerate(statuses):
                param_name = f"@status{i}"
                status_conditions.append(f"c.status = {param_name}")
                params.append({"name": param_name, "value": status})
            query += f" AND ({' OR '.join(status_conditions)})"
            
        # Add sorting
        sort_field = {
            'priority': 'c.priorityValue',
            'dueDate': 'c.dueDate',
            'createdAt': 'c.createdAt'
        }.get(sort_by, 'c.priorityValue')
        
        # For priority, we want asc to mean highest priority first (1 = Very High)
        if sort_by == 'priority':
            sort_direction = 'asc' if sort_direction == 'desc' else 'desc'
            
        query += f" ORDER BY {sort_field} {sort_direction.upper()}"
        
        # Query items from CosmosDB
        items = cosmos_db.query_items(query, params, partition_key=user_id)
        
        if items is None:
            return jsonify([]), 200
            
        return jsonify(items), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/batch-update', methods=['PATCH'])
def batch_update():
    try:
        data = request.json
        if not data.get('updates'):
            return jsonify({'error': 'No updates provided'}), 400

        valid_statuses = ['Not Started', 'Working on it', 'Complete']
        valid_priorities = ['Very High', 'High', 'Medium', 'Low', 'Very Low']
        priority_map = {
            'Very High': 1,
            'High': 2,
            'Medium': 3,
            'Low': 4,
            'Very Low': 5
        }

        updated_items = []
        for update in data['updates']:
            item_id = update.pop('id', None)
            if not item_id:
                continue

            # Validate status if it's being updated
            if 'status' in update and update['status'] not in valid_statuses:
                return jsonify({'error': f'Invalid status value for item {item_id}. Must be one of: {", ".join(valid_statuses)}'}), 400

            # Validate priority if it's being updated
            if 'priority' in update:
                if update['priority'] not in valid_priorities:
                    return jsonify({'error': f'Invalid priority value for item {item_id}. Must be one of: {", ".join(valid_priorities)}'}), 400
                update['priorityValue'] = priority_map[update['priority']]

            # Add updatedAt timestamp
            update['updatedAt'] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

            # Update the item in CosmosDB
            updated_item = cosmos_db.update_item(item_id, update)
            if updated_item:
                updated_items.append(updated_item)

        return jsonify(updated_items), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
