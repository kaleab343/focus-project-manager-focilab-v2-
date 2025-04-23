import React from 'react';
import { useDrag } from 'react-dnd';
import { TodoItemProps, ItemTypes } from './types';

/**
 * TodoItem component - Represents a single todo item in the list
 * @component
 * @param {TodoItemProps} props - The component props
 * @returns {React.ReactElement} A draggable todo item with checkbox and edit/delete functionality
 */
export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag<any, any, { isDragging: boolean }>({
    type: ItemTypes.TODO,
    item: todo,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return drag(
    <div className="flex items-center mb-2 relative group">
      <input
        type="checkbox"
        id={`todo-${todo.id}`}
        checked={todo.status === 'completed'}
        onChange={() => onToggle(todo.id, todo.status !== 'completed')}
        className="mr-2.5 cursor-pointer"
      />
      <div className="flex items-center justify-between flex-1">
        <label 
          htmlFor={`todo-${todo.id}`}
          className="inline-flex items-center cursor-pointer break-words text-lg"
        >
          <span 
            className={`inline-block ${
              todo.status === 'completed' ? 'line-through text-white/50' : ''
            } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
            style={{ cursor: 'text' }}
            onDoubleClick={(e) => {
              e.preventDefault();
              if (todo.status !== 'completed') {
                onEdit(todo);
              }
            }}
          >
            {todo.title}
          </span>
        </label>
        <button 
          className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
          onClick={(e) => {
            e.preventDefault();
            onDelete(todo.id);
          }}
          aria-label="Delete todo"
        >
          ×
        </button>
      </div>
    </div>
  );
};
