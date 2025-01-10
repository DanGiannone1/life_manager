
from cosmos_db import CosmosDBManager
from datetime import datetime, timedelta, timezone
import uuid

def cleanup_test_data(cosmos_manager: CosmosDBManager, user_id: str):
    """Delete all existing documents for the test user"""
    try:
        # Query for all items belonging to this user
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        items = list(cosmos_manager.container.query_items(
            query=query,
            parameters=[{"name": "@user_id", "value": user_id}],
            enable_cross_partition_query=False
        ))
        
        # Delete each item
        for item in items:
            cosmos_manager.delete_item(item['id'], user_id)
            print(f"Deleted existing item: {item['id']}")
        
        print(f"Cleaned up {len(items)} existing items for user {user_id}")
    except Exception as e:
        print(f"Error during cleanup: {str(e)}")
        raise

def create_iso_date(days_from_now=0):
    """Create ISO formatted date string for a date N days from now"""
    date = datetime.now(timezone.utc) + timedelta(days=days_from_now)
    return date.isoformat()

def generate_sample_tasks():
    """Generate 5 sample tasks with different characteristics"""
    test_user_id = "test-user"
    
    tasks = [
        {
            "id": str(uuid.uuid4()),
            "user_id": test_user_id,
            "type": "task",
            
            "title": "Daily Exercise Routine",
            "status": "not_started",
            "priority": 80,
            "dynamic_priority": 85,
            "effort": 3,
            "notes": "30 minutes of cardio followed by strength training",
            "due_date": create_iso_date(1),
            "scheduled_date": create_iso_date(1),
            "completion_history": [],
            "recurrence": {
                "is_recurring": True,
                "rule": {
                    "frequency": "daily",
                    "interval": 1,
                    "days_of_week": [0, 1, 2, 3, 4]  # Weekdays only
                }
            }
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": test_user_id,
            "type": "task",
            
            "title": "Quarterly Financial Review",
            "status": "working_on_it",
            "priority": 90,
            "dynamic_priority": 95,
            "effort": 5,
            "notes": "Review Q1 financial statements and prepare report",
            "due_date": create_iso_date(14),
            "scheduled_date": None,
            "completion_history": [],
            "recurrence": {
                "is_recurring": False,
                "rule": None
            }
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": test_user_id,
            "type": "task",
            
            "title": "Weekly Team Meeting",
            "status": "not_started",
            "priority": 70,
            "dynamic_priority": 70,
            "effort": 2,
            "notes": None,
            "due_date": None,
            "scheduled_date": create_iso_date(7),
            "completion_history": [],
            "recurrence": {
                "is_recurring": True,
                "rule": {
                    "frequency": "weekly",
                    "interval": 1,
                    "days_of_week": [1],  # Monday
                    "day_of_month": None,
                    "months": None,
                    "week_of_month": None
                }
            }
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": test_user_id,
            "type": "task",
            
            "title": "Read 'Deep Work' Book",
            "status": "working_on_it",
            "priority": 40,
            "dynamic_priority": 45,
            "effort": 3,
            "notes": "Complete chapters 4-6",
            "due_date": create_iso_date(30),
            "scheduled_date": None,
            "completion_history": [],
            "recurrence": {
                "is_recurring": False,
                "rule": None
            }
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": test_user_id,
            "type": "task",
            
            "title": "Update Personal Website",
            "status": "complete",
            "priority": 60,
            "dynamic_priority": 0,  # Completed tasks have 0 dynamic priority
            "effort": 4,
            "notes": "Refresh portfolio and add recent projects",
            "due_date": create_iso_date(-2),
            "scheduled_date": None,
            "completion_history": [{
                "completed_at": create_iso_date(-1),
                "next_due_date": None,
                "completion_notes": "Added three new projects and updated bio"
            }],
            "recurrence": {
                "is_recurring": False,
                "rule": None
            }
        }
    ]
    
    return tasks

def main():
    try:
        # Initialize the CosmosDB manager
        cosmos_manager = CosmosDBManager()
        
        # Clean up any existing test data
        print("\nCleaning up existing test data...")
        cleanup_test_data(cosmos_manager, "test-user")
        
        print("\nGenerating and loading new test data...")
        # Generate sample tasks
        tasks = generate_sample_tasks()
        
        # Create each task in Cosmos DB
        created_tasks = []
        for task in tasks:
            try:
                # Note: create_item will automatically add created_at and updated_at
                created_task = cosmos_manager.create_item(task)
                created_tasks.append(created_task)
                print(f"Created task: {created_task['title']}")
            except Exception as e:
                print(f"Error creating task '{task['title']}': {str(e)}")
        
        # Verify the data was loaded
        user_data = cosmos_manager.get_user_data("test-user")
        print(f"\nSuccessfully loaded {len(user_data['tasks'])} tasks for test-user")
        
        # Print sample verification data
        if created_tasks:
            sample_task = created_tasks[0]
            print("\nSample task verification:")
            print(f"ID: {sample_task['id']}")
            print(f"Created At: {sample_task['created_at']}")
            print(f"Updated At: {sample_task['updated_at']}")
            print(f"Title: {sample_task['title']}")
            print(f"Status: {sample_task['status']}")
        
    except Exception as e:
        print(f"Error in main: {str(e)}")

if __name__ == "__main__":
    main()