"""
### cosmos_db.py ###

This module handles interactions with Azure Cosmos DB, including database and container creation,
and CRUD operations on documents. It automatically selects between key-based and DefaultAzureCredential
authentication based on the presence of COSMOS_MASTER_KEY. Logging is configured to show only
custom messages.

Requirements:
    azure-cosmos==4.5.1
    azure-identity==1.12.0
"""

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, exceptions, PartitionKey
from azure.cosmos.container import ContainerProxy
from azure.cosmos.database import DatabaseProxy
from azure.identity import DefaultAzureCredential

class CosmosDBManager:
    def __init__(self, cosmos_host=None, cosmos_database_id=None, cosmos_container_id=None):
        self._load_env_variables(cosmos_host, cosmos_database_id, cosmos_container_id)
        self.client = self._get_cosmos_client()
        self.database: Optional[DatabaseProxy] = None
        self.container: Optional[ContainerProxy] = None
        self._initialize_database_and_container()

    def _load_env_variables(self, cosmos_host=None, cosmos_database_id=None, cosmos_container_id=None):
        load_dotenv()
        self.cosmos_host = cosmos_host or os.environ.get("COSMOS_HOST")
        self.cosmos_database_id = cosmos_database_id or os.environ.get("COSMOS_DATABASE_ID")
        self.cosmos_container_id = cosmos_container_id or os.environ.get("COSMOS_CONTAINER_ID")
        self.tenant_id = os.environ.get("TENANT_ID", '16b3c013-d300-468d-ac64-7eda0820b6d3')

        if not all([self.cosmos_host, self.cosmos_database_id, self.cosmos_container_id]):
            raise ValueError("Cosmos DB configuration is incomplete")

    def _get_cosmos_client(self) -> CosmosClient:
        print("Initializing Cosmos DB client")
        print("Using DefaultAzureCredential for Cosmos DB authentication")
        credential = DefaultAzureCredential(
            interactive_browser_tenant_id=self.tenant_id,
            visual_studio_code_tenant_id=self.tenant_id,
            workload_identity_tenant_id=self.tenant_id,
            shared_cache_tenant_id=self.tenant_id
        )
        return CosmosClient(self.cosmos_host, credential=credential)

    def _initialize_database_and_container(self) -> None:
        try:
            self.database = self._create_or_get_database()
            self.container = self._create_or_get_container()
        except exceptions.CosmosHttpResponseError as e:
            print(f'An error occurred: {e.message}')
            raise

    def _create_or_get_database(self) -> DatabaseProxy:
        try:
            database = self.client.create_database(id=self.cosmos_database_id)
            print(f'Database with id \'{self.cosmos_database_id}\' created')
        except exceptions.CosmosResourceExistsError:
            database = self.client.get_database_client(self.cosmos_database_id)
            print(f'Database with id \'{self.cosmos_database_id}\' was found')
        return database

    def _create_or_get_container(self) -> ContainerProxy:
        try:
            container = self.database.create_container(
                id=self.cosmos_container_id, 
                partition_key=PartitionKey(path='/user_id')
            )
            print(f'Container with id \'{self.cosmos_container_id}\' created')
        except exceptions.CosmosResourceExistsError:
            container = self.database.get_container_client(self.cosmos_container_id)
            print(f'Container with id \'{self.cosmos_container_id}\' was found')
        return container

    def create_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new item in the container. Fails if an item with the same ID already exists.

        :param item: The item to create
        :return: The created item, or None if creation failed
        """
        try:
            created_item = self.container.create_item(body=item)
            print(f"Item created with id: {created_item['id']}")
            return created_item
        except exceptions.CosmosResourceExistsError:
            print(f"Item with id {item['id']} already exists. Use update_item or upsert_item to modify.")
            return None
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during creation: {e.message}")
            return None

    def update_item(self, item_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update specific fields of an existing item in the container.

        :param item_id: The ID of the item to update
        :param updates: Dictionary of fields to update
        :return: The updated item, or None if update failed
        """
        try:
            # First, get the existing item
            query = "SELECT * FROM c WHERE c.id = @id"
            params = [{"name": "@id", "value": item_id}]
            items = list(self.container.query_items(
                query=query,
                parameters=params,
                enable_cross_partition_query=True
            ))
            
            if not items:
                print(f"Item with id {item_id} not found")
                return None
            
            # Get the existing item
            existing_item = items[0]
            
            # Update the fields
            existing_item.update(updates)
            
            # Replace the item in the container
            updated_item = self.container.replace_item(
                item=item_id,
                body=existing_item
            )
            print(f"Item updated with id: {updated_item['id']}")
            return updated_item
            
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during update: {e.message}")
            return None

    def upsert_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Upsert (create or update) an item in the container.

        :param item: The item to upsert
        :return: The upserted item, or None if upsert failed
        """
        try:
            upserted_item = self.container.upsert_item(body=item)
            print(f"Item upserted with id: {upserted_item['id']}")
            return upserted_item
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during upsert: {e.message}")
            return None

    def query_items(self, query: str, parameters: Optional[List[Dict[str, Any]]] = None, partition_key: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            items = list(self.container.query_items(
                query=query,
                parameters=parameters,
                partition_key=partition_key,
                enable_cross_partition_query=(partition_key is None)
            ))
            print(f"Query returned {len(items)} items")
            return items
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during query: {e.message}")
            return []

    def delete_item(self, item_id: str, partition_key: str) -> bool:
        try:
            self.container.delete_item(item=item_id, partition_key=partition_key)
            print(f"Item deleted with id: {item_id}")
            return True
        except exceptions.CosmosResourceNotFoundError:
            print(f"Item with id {item_id} not found. Unable to delete.")
            return False
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during deletion: {e.message}")
            return False

    def get_items_by_user_id(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get all items for a specific user.

        :param user_id: The user's ID
        :return: List of items belonging to the user
        """
        query = "SELECT * FROM c WHERE c.user_id = @user_id"
        parameters = [{"name": "@user_id", "value": user_id}]
        return self.query_items(query, parameters, partition_key=user_id)

    def bulk_update(self, updates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Update multiple items in a single operation.

        :param updates: List of tuples containing (item_id, update_dict)
        :return: List of updated items
        """
        try:
            # First get all items we need to update
            item_ids = [update['id'] for update in updates]
            query = "SELECT * FROM c WHERE c.id IN (@ids)"
            params = [{"name": "@ids", "value": item_ids}]
            items = list(self.container.query_items(
                query=query,
                parameters=params,
                enable_cross_partition_query=True
            ))

            if not items:
                return []

            # Create a mapping of id to item for easy lookup
            items_dict = {item['id']: item for item in items}
            
            # Prepare all operations
            operations = []
            updated_items = []
            
            for update in updates:
                item_id = update.pop('id')
                if item_id not in items_dict:
                    continue
                    
                # Get the existing item and update it
                item = items_dict[item_id].copy()
                item.update(update)
                
                # Add to operations list
                operations.append(('upsert', item))
                updated_items.append(item)
                
            # Execute all operations in a single batch
            if operations:
                self.container.execute_multi(operations)
                
            return updated_items
            
        except exceptions.CosmosHttpResponseError as e:
            print(f"An error occurred during bulk update: {e.message}")
            return []

def example_create_item():
    cosmos_db = CosmosDBManager()
    new_item = {
        'id': 'item1',
        'user_id': 'test-user',
        'name': 'John Doe',
        'age': 30
    }
    created_item = cosmos_db.create_item(new_item)
    if created_item:
        print(f"Created item: {created_item}")
    else:
        print("Failed to create item. It might already exist.")

def example_update_item():
    cosmos_db = CosmosDBManager()
    item_to_update = {
        'id': 'item1',
        'user_id': 'test-user',
        'name': 'John Doe',
        'age': 31  # Updated age
    }
    updated_item = cosmos_db.update_item(item_to_update)
    if updated_item:
        print(f"Updated item: {updated_item}")
    else:
        print("Failed to update item. It might not exist.")

def example_upsert_item():
    cosmos_db = CosmosDBManager()
    item_to_upsert = {
        'id': 'item2',
        'user_id': 'test-user',
        'name': 'Jane Doe',
        'age': 28
    }
    upserted_item = cosmos_db.upsert_item(item_to_upsert)
    if upserted_item:
        print(f"Upserted item: {upserted_item}")
    else:
        print("Failed to upsert item.")

def example_query_items():
    cosmos_db = CosmosDBManager()
    query = "SELECT * FROM c WHERE c.user_id = @user_id"
    parameters = [{"name": "@user_id", "value": "test-user"}]
    items = cosmos_db.query_items(query, parameters)
    print(f"Queried items: {items}")

def example_delete_item():
    cosmos_db = CosmosDBManager()
    if cosmos_db.delete_item('item1', 'test-user'):
        print("Item deleted successfully")
    else:
        print("Failed to delete item")

if __name__ == "__main__":
    try:
        example_create_item()
        example_update_item()
        example_upsert_item()
        example_query_items()
        example_delete_item()
    except Exception as e:
        print(f"An error occurred: {str(e)}")