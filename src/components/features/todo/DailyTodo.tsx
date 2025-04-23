import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { generateTodoList, getContextFromLocalStorage, TodoItemType } from '@/utils/agents';
import { useTodos, standardizeDayAbbreviation, Todo } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';
import { AISuggestionItem } from './AISuggestionItem';
import { DailyTodoProps } from './types';

/**
 * DailyTodo component - Manages and displays todos for a specific day
 * @component
 * @param {DailyTodoProps} props - The component props
 * @returns {React.ReactElement} A todo list with AI suggestions and management functionality
 */
export const DailyTodo: React.FC<DailyTodoProps> = ({ selectedDay }) => {
  const {
    todos,
    aiSuggestions,
    loading,
    addTodo,
    addAISuggestions,
    updateTodo,
    updateAISuggestion,
    deleteTodo,
    deleteAISuggestion,
    approveAiSuggestion,
    getTodosByDay,
    hasAISuggestions,
    hasGenerated,
    clearAISuggestions
  } = useTodos();
  
  const [showInput, setShowInput] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Get the standardized day abbreviation
  const dayAbbrev = standardizeDayAbbreviation(selectedDay);

  // Get todos for the selected day
  const todosForDay = getTodosByDay(dayAbbrev);
  
  const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const fullDayName = selectedDay === "Today" ? "Today" : fullWeekDays[fullWeekDays.findIndex(day => day.startsWith(selectedDay))];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowInput(false);
        setNewTodoText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate AI suggestions when needed
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!hasGenerated && !isGenerating) {
        try {
          setIsGenerating(true);
          const context = getContextFromLocalStorage();
          const aiTodos = await generateTodoList(context);
          addAISuggestions(aiTodos.map(todo => todo.title));
        } catch (error) {
          console.error('Error generating AI todos:', error);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generateSuggestions();
  }, [hasGenerated, addAISuggestions, isGenerating]);

  const handleAddTodo = () => {
    if (newTodoText.trim() !== '') {
      addTodo({
        title: newTodoText.trim(),
        date: dayAbbrev,
        status: 'not-started'
      });
      setNewTodoText('');
      setShowInput(false);
    }
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    updateTodo(id, { 
      status: completed ? 'completed' : 'in-progress' 
    });
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.title);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewTodoText('');
    }
  };

  return (
    <div className="rounded-lg p-4 w-full">
      <h2 className="mt-0 mb-4 text-2xl text-white">{fullDayName}'s Todo</h2>
      
      <div className="space-y-2">
        {todosForDay.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={handleToggleTodo}
            onEdit={startEditing}
            onDelete={deleteTodo}
          />
        ))}

        {aiSuggestions.map(suggestion => (
          <AISuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            onUpdate={updateAISuggestion}
            onApprove={(id) => approveAiSuggestion(id, dayAbbrev)}
            onDelete={deleteAISuggestion}
          />
        ))}

        {showInput ? (
          <div ref={inputRef} className="flex items-center mb-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full text-left text-white/50 hover:text-white transition-colors text-lg"
          >
            + Add todo
          </button>
        )}
      </div>
    </div>
  );
};
