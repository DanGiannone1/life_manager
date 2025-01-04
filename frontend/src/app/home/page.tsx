"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddWidgetDialog } from "@/components/widgets/add-widget-dialog";
import { AVAILABLE_WIDGETS, WidgetType } from "@/types/widgets";
import { X } from "lucide-react";

export default function Home() {
  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>(['today-tasks', 'progress-stats']);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const handleAddWidget = (widgetId: WidgetType) => {
    setActiveWidgets(prev => [...prev, widgetId]);
  };

  const handleRemoveWidget = (widgetId: WidgetType) => {
    setActiveWidgets(prev => prev.filter(id => id !== widgetId));
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Welcome to Life Manager</h1>
          <p className="text-gray-500 mt-1">Your personal productivity dashboard</p>
        </div>
        <Button onClick={() => setShowAddWidget(true)} className="page-header-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeWidgets.map(widgetId => {
          const widget = AVAILABLE_WIDGETS.find(w => w.id === widgetId);
          if (!widget) return null;

          const WidgetComponent = widget.component;
          return (
            <div key={widgetId} className="relative group">
              <button
                onClick={() => handleRemoveWidget(widgetId)}
                className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
              <WidgetComponent />
            </div>
          );
        })}
      </div>

      <AddWidgetDialog
        open={showAddWidget}
        onOpenChange={setShowAddWidget}
        onAddWidget={handleAddWidget}
        activeWidgets={activeWidgets}
      />
    </div>
  );
}
