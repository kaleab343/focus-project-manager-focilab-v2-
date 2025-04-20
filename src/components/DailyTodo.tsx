import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { generateTodoList, getContextFromLocalStorage, TodoItemType } from '../../utils/agents';
import { useTodos, Todo, AISuggestion, standardizeDayAbbreviation } from '../hooks/useTodos';

interface DailyTodoProps {
  selectedDay: string;
}

// Define the drag item type
export const ItemTypes = {
  TODO: 'todo',
};

const DailyTodo: React.FC<DailyTodoProps> = ({ selectedDay }) => {
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
  
  // Combine regular todos and AI suggestions for display
  const filteredTodos = todosForDay;

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
      // Only generate if we haven't already and we're not currently generating
      if (!hasGenerated && !isGenerating) {
        try {
          setIsGenerating(true);
          const context = getContextFromLocalStorage();
          const aiTodos = await generateTodoList(context);
          
          // Add AI todos to localStorage via the hook
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
        name: newTodoText.trim(),
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
    setEditText(todo.name);
  };

  const saveEdit = () => {
    if (editingTodoId && editText.trim() !== '') {
      updateTodo(editingTodoId, { name: editText.trim() });
      setEditingTodoId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewTodoText('');
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingTodoId(null);
      setEditText('');
    }
  };

  // Component for a draggable todo item
  const DraggableTodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    const [{ isDragging }, dragRef] = useDrag({
      type: ItemTypes.TODO,
      item: todo,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    return (
      <div className="flex items-center mb-2 relative group">
        <input
          type="checkbox"
          id={`todo-${todo.id}`}
          checked={todo.status === 'completed'}
          onChange={() => handleToggleTodo(todo.id, todo.status !== 'completed')}
          className="mr-2.5 cursor-pointer"
        />
        <div className="flex items-center justify-between flex-1">
          <label 
            htmlFor={`todo-${todo.id}`}
            className="inline-flex items-center cursor-pointer break-words text-lg"
          >
            <span 
              ref={dragRef as any}
              className={`inline-block ${
                todo.status === 'completed' ? 'line-through text-white/50' : ''
              } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
              style={{ cursor: 'text' }}
              onDoubleClick={(e) => {
                e.preventDefault();
                if (todo.status !== 'completed') {
                  startEditing(todo);
                }
              }}
            >
              {todo.name}
            </span>
          </label>
          <button 
            className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              deleteTodo(todo.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // Component for AI suggestion item
  const AISuggestionItem: React.FC<{ suggestion: AISuggestion }> = ({ suggestion }) => {
    return (
      <div className="flex items-center mb-2 relative group">
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <textarea
              value={suggestion.text}
              onChange={(e) => {
                updateAISuggestion(suggestion.id, e.target.value);
              }}
              className="flex-1 px-0 py-0 border-none rounded bg-transparent text-white text-lg resize-none w-full focus:outline-none"
              style={{
                lineHeight: '1.5',
                overflow: 'hidden',
                height: 'auto',
              }}
              ref={(textareaRef) => {
                if (textareaRef) {
                  textareaRef.style.height = 'auto';
                  textareaRef.style.height = `${textareaRef.scrollHeight}px`;
                }
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
              rows={1}
            />
            <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
              <span className="text-sm">✨</span> AI
            </span>
            <div className="flex items-center gap-2">
              <button
                className="text-green-400 hover:text-green-300 transition-colors"
                onClick={() => approveAiSuggestion(suggestion.id, dayAbbrev)}
                title="Approve"
              >
                ✓
              </button>
              <button
                className="text-red-400 hover:text-red-300 transition-colors"
                onClick={() => deleteAISuggestion(suggestion.id)}
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg p-4 w-full">
      <h2 className="mt-0 mb-4 text-2xl text-white">{fullDayName}'s Todo</h2>
      
      {isGenerating && (
        <div className="mb-4 text-white/60 text-sm flex items-center gap-2">
          <span className="text-sm">✨</span> Generating AI suggestions...
        </div>
      )}

      {loading ? (
        <div className="mb-4 text-white/60 text-sm">Loading todos...</div>
      ) : (
        <>
          {/* Regular todos */}
          <div className="mb-4">
            <h3 className="text-lg text-white mb-2">Tasks</h3>
            {filteredTodos.length === 0 ? (
              <div className="text-white/60 text-sm">No todos for this day</div>
            ) : (
              filteredTodos.map(todo => (
                <DraggableTodoItem key={todo.id} todo={todo} />
              ))
            )}
          </div>

          {/* AI Suggestions */}
          {hasAISuggestions() && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg text-white">Suggestions</h3>
                <button 
                  className="text-xs text-white/60 hover:text-white/80"
                  onClick={clearAISuggestions}
                >
                  Clear all
                </button>
              </div>
              {aiSuggestions.map(suggestion => (
                <AISuggestionItem key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </>
      )}
      
      {showInput ? (
        <div className="mt-2.5" ref={inputRef}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new todo..."
            autoFocus
            className="w-full px-3 py-2 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
          />
        </div>
      ) : (
        <button 
          className="bg-transparent border-none w-[30px] h-[30px] flex items-center justify-center text-2xl text-white cursor-pointer"
          onClick={() => setShowInput(true)}
        >
          +
        </button>
      )}
    </div>
  );
};

export default DailyTodo; 