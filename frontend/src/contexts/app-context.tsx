'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { TaskItem, GoalItem } from '@/types/items';

type Item = TaskItem | GoalItem;

interface ErrorResponse {
  error: string;
  stack?: string;
}

interface AppContextType {
  items: Item[];
  loading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  updateItem: (updatedItem: Item) => Promise<void>;
  createItem: (newItem: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/get-master-list');
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        console.error('Error Details:', errorData);  // Log the full error details
        throw new Error(errorData.error);
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Full error:', error);  // Log the full error
      setError(error instanceof Error ? error.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchItems();
  }, []);

  const refreshItems = async () => {
    await fetchItems();
  };

  const updateItem = async (updatedItem: Item) => {
    try {
      // Strip out CosmosDB metadata fields
      const { 
        Attachments, 
        Etag, 
        Rid, 
        Self, 
        Ts, 
        ...itemToUpdate 
      } = updatedItem as any;

      const response = await fetch('http://localhost:5000/api/batch-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: [itemToUpdate],
        }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        console.error('Update error details:', errorData);  // Log full error details
        throw new Error(errorData.error);
      }

      // Update local state
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } catch (error) {
      console.error('Full update error:', error);  // Log the full error
      setError(error instanceof Error ? error.message : 'Failed to update item');
      throw error;
    }
  };

  const createItem = async (newItem: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('http://localhost:5000/api/create-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        console.error('Create error details:', errorData);  // Log full error details
        throw new Error(errorData.error);
      }

      // Refresh items to get the new item
      await refreshItems();
    } catch (error) {
      console.error('Full create error:', error);  // Log the full error
      setError(error instanceof Error ? error.message : 'Failed to create item');
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        items,
        loading,
        error,
        refreshItems,
        updateItem,
        createItem,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}