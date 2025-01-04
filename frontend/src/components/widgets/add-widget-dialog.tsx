import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AVAILABLE_WIDGETS, WidgetType } from "@/types/widgets";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widgetId: WidgetType) => void;
  activeWidgets: WidgetType[];
}

export function AddWidgetDialog({ open, onOpenChange, onAddWidget, activeWidgets }: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {AVAILABLE_WIDGETS.map((widget) => {
            const isActive = activeWidgets.includes(widget.id);
            return (
              <div
                key={widget.id}
                className="flex items-start justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <h4 className="font-medium">{widget.title}</h4>
                  <p className="text-sm text-gray-500">{widget.description}</p>
                </div>
                <Button
                  size="icon"
                  variant={isActive ? "secondary" : "default"}
                  onClick={() => {
                    onAddWidget(widget.id);
                    onOpenChange(false);
                  }}
                  disabled={isActive}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
} 