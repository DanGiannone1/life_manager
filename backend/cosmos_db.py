# File: backend/cosmos_db.py

import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, exceptions, PartitionKey
from azure.cosmos.container import ContainerProxy
from azure.cosmos.database import DatabaseProxy
from azure.identity import DefaultAzureCredential
from datetime import datetime, timezone, timedelta
import traceback

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
        try:
            print(f"\n=== Updating Item {item_id} ===")
            print(f"Update data: {updates}")
            
            # First, get the existing item
            existing_item = self.get_item_by_id(item_id)
            if not existing_item:
                print(f"ERROR: Item with id {item_id} not found")
                raise ValueError(f"Item with id {item_id} not found")
            
            print(f"Found existing item: {existing_item}")
            
            # Update the existing item with new values
            existing_item.update(updates)
            
            # Ensure we have the partition key (user_id)
            if 'user_id' not in existing_item:
                print("ERROR: user_id (partition key) is required for update operation")
                raise ValueError("user_id (partition key) is required for update operation")
            
            print(f"Attempting to replace item with updated data: {existing_item}")
            try:
                updated_item = self.container.replace_item(
                    item=item_id,
                    body=existing_item,
                    partition_key=existing_item['user_id']
                )
                print(f"Successfully updated item: {updated_item}")
                return updated_item
            except Exception as inner_e:
                print(f"ERROR during replace operation: {str(inner_e)}")
                print(f"Stack trace:\n{traceback.format_exc()}")
                raise
            
        except Exception as e:
            print(f"ERROR during update: {str(e)}")
            print(f"Stack trace:\n{traceback.format_exc()}")
            raise

    def upsert_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        try:
            print(f"\n=== Upserting Item ===")
            print(f"Item data: {item}")
            
            if 'user_id' not in item:
                print("ERROR: user_id (partition key) is required for upsert operation")
                raise ValueError("user_id (partition key) is required for upsert operation")
            
            try:
                upserted_item = self.container.upsert_item(
                    body=item,
                    partition_key=item['user_id']
                )
                print(f"Successfully upserted item: {upserted_item}")
                return upserted_item
            except Exception as inner_e:
                print(f"ERROR during upsert operation: {str(inner_e)}")
                print(f"Stack trace:\n{traceback.format_exc()}")
                raise
                
        except Exception as e:
            print(f"ERROR during upsert: {str(e)}")
            print(f"Stack trace:\n{traceback.format_exc()}")
            raise

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


