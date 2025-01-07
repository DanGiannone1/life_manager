import { Button } from "@/components/wrappers/button";
import { Plus } from "lucide-react";

export function AddGoalDialog() {
  return (
    <Button 
      variant="outline" 
      size="sm"
      className="gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Goal
    </Button>
  );
} 