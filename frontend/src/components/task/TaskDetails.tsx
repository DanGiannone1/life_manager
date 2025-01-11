import React from 'react';
import { Task } from '../../utils/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface TaskDetailsProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetails = ({ task, open, onOpenChange }: TaskDetailsProps) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Status</div>
            <div className="col-span-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                task.status === 'complete' ? 'bg-green-500' :
                task.status === 'workingOnIt' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              {task.status === 'notStarted' ? 'Not Started' :
               task.status === 'workingOnIt' ? 'Working on It' :
               'Complete'}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Priority</div>
            <div className="col-span-3">
              <div className={`inline-flex px-2 py-1 rounded-full text-xs ${
                task.priority >= 80 ? 'bg-red-100 text-red-800' :
                task.priority >= 60 ? 'bg-orange-100 text-orange-800' :
                task.priority >= 40 ? 'bg-yellow-100 text-yellow-800' :
                task.priority >= 20 ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.priority}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Due Date</div>
            <div className="col-span-3">{formatDate(task.dueDate)}</div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="font-medium">Scheduled</div>
            <div className="col-span-3">{formatDate(task.scheduledDate)}</div>
          </div>

          {task.notes && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="font-medium">Notes</div>
              <div className="col-span-3 whitespace-pre-wrap">{task.notes}</div>
            </div>
          )}

          {task.recurrence?.isRecurring && task.recurrence.rule && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="font-medium">Recurrence</div>
              <div className="col-span-3">
                Every {task.recurrence.rule.interval} {task.recurrence.rule.frequency}
                {task.recurrence.rule.endDate && ` until ${formatDate(task.recurrence.rule.endDate)}`}
              </div>
            </div>
          )}

          {task.completionHistory.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <div className="font-medium">History</div>
              <div className="col-span-3">
                <div className="space-y-2">
                  {task.completionHistory.map((entry, index) => (
                    <div key={index} className="text-sm">
                      Completed on {formatDate(entry.completedAt)}
                      {entry.completionNotes && (
                        <div className="text-gray-600 ml-4">{entry.completionNotes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails; 