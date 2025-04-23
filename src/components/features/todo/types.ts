import { Todo as TodoType } from '../../../hooks/useTodos';

export interface TodoItemProps {
  todo: TodoType;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (todo: TodoType) => void;
  onDelete: (id: string) => void;
}

export interface AISuggestionItemProps {
  suggestion: {
    id: string;
    text: string;
  };
  onUpdate: (id: string, text: string) => void;
  onApprove: (id: string, day: string) => void;
  onDelete: (id: string) => void;
}

export interface DailyTodoProps {
  selectedDay: string;
}

export const ItemTypes = {
  TODO: 'todo',
} as const;
