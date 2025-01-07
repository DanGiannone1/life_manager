import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Task, Goal } from '../../types';
import { updateTask } from '../../store/slices/tasksSlice';
import { updateGoal } from '../../store/slices/goalsSlice';
import { Input } from '../wrappers/input';
import { useDebounce } from '../../hooks/useDebounce';

// Only allow editing of string fields that exist in both Task and Goal
type EditableFields = Extract<keyof Task & keyof Goal, string>;
type EditableItem = Task | Goal;

const getItemValue = (item: EditableItem, field: EditableFields): string => {
  const value = item[field];
  return typeof value === 'string' ? value : '';
};

interface InlineEditProps {
  item: EditableItem;
  field: EditableFields;
}

export const InlineEdit = ({ item, field }: InlineEditProps) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(getItemValue(item, field));
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 1000);

  useEffect(() => {
    if (debouncedValue !== getItemValue(item, field)) {
      const changes = {
        [field]: debouncedValue,
        updatedAt: new Date().toISOString(),
      } as const;

      if (item.type === 'task') {
        dispatch(updateTask({
          id: item.id,
          changes,
        }));
      } else {
        dispatch(updateGoal({
          id: item.id,
          changes,
        }));
      }
    }
  }, [debouncedValue, dispatch, field, item]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-text"
      role="button"
      tabIndex={0}
    >
      {value}
    </div>
  );
};

export default InlineEdit; 