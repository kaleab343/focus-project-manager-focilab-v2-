import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { generateTodoList, getContextFromLocalStorage, TodoItemType } from '../../utils/agets';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string;
  isAISuggestion?: boolean;
}

interface HomeTodoProps {
  selectedDay: string;
}

const HomeTodo: React.FC<HomeTodoProps> = ({ selectedDay }) => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const storedTodos = localStorage.getItem('dailyTodos');
      // Only load non-AI todos from localStorage
      const parsedTodos = storedTodos ? JSON.parse(storedTodos) : [];
      return parsedTodos.filter((todo: Todo) => !todo.isAISuggestion);
    } catch (error) {
      console.error('Error loading initial todos:', error);
      return [];
    }
  });
  
  // Separate state for AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<Todo[]>([]);
  
  const [showInput, setShowInput] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [hasGeneratedForDay, setHasGeneratedForDay] = useState<string>('');

  // Get current day abbreviation (e.g., "Mon", "Tue", etc.)
  const getCurrentDayAbbrev = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Get the actual day abbreviation to use for filtering
  const dayAbbrev = selectedDay === "Today" ? getCurrentDayAbbrev() : selectedDay;

  // Combine regular todos and AI suggestions for display
  const filteredTodos = [...todos, ...aiSuggestions].filter(todo => todo.date === dayAbbrev);

  const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const fullDayName = selectedDay === "Today" ? "Today" : fullWeekDays[fullWeekDays.findIndex(day => day.startsWith(selectedDay))];

  // Save only non-AI todos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('dailyTodos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]); // Only triggers when regular todos change

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

  // Clear AI suggestions when day changes
  useEffect(() => {
    setAiSuggestions([]);
    setHasGeneratedForDay('');
  }, [dayAbbrev]);

  // Generate AI suggestions when needed
  useEffect(() => {
    const generateSuggestions = async () => {
      const todosForDay = todos.filter(todo => todo.date === dayAbbrev);
      const hasNoRegularTodos = todosForDay.length === 0;
      const hasntGeneratedToday = hasGeneratedForDay !== dayAbbrev;
      
      if (hasNoRegularTodos && hasntGeneratedToday && !isGenerating) {
        try {
          setIsGenerating(true);
          const context = getContextFromLocalStorage();
          const aiTodos = await generateTodoList(context);
          
          // Add AI todos to suggestions state
          const newTodos = aiTodos.map(todo => ({
            id: todo.id,
            text: todo.title,
            completed: false,
            date: dayAbbrev,
            isAISuggestion: true
          }));

          setAiSuggestions(newTodos); // Replace instead of append
          setHasGeneratedForDay(dayAbbrev);
        } catch (error) {
          console.error('Error generating AI todos:', error);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    if (dayAbbrev) { // Only run if dayAbbrev is valid
      generateSuggestions();
    }
  }, [dayAbbrev, todos, hasGeneratedForDay]); // Remove aiSuggestions and isGenerating from dependencies

  // Function to approve an AI todo
  const approveTodo = (id: string) => {
    // Find the todo in AI suggestions
    const approvedTodo = aiSuggestions.find(todo => todo.id === id);
    if (approvedTodo) {
      // Add to regular todos without AI flag and save to localStorage
      const regularTodo = {
        ...approvedTodo,
        isAISuggestion: false
      };
      
      // Add to permanent todos
      setTodos(prevTodos => [...prevTodos, regularTodo]);
      
      // Remove from AI suggestions
      setAiSuggestions(prev => prev.filter(todo => todo.id !== id));
    }
  };

  // Function to deny/remove an AI todo
  const denyTodo = (id: string) => {
    // Simply remove from AI suggestions
    setAiSuggestions(prev => {
      const newSuggestions = prev.filter(todo => todo.id !== id);
      
      // If this was the last AI suggestion and there are no regular todos,
      // reset the generation flag so new suggestions can be generated
      if (newSuggestions.length === 0 && todos.filter(todo => todo.date === dayAbbrev).length === 0) {
        setHasGeneratedForDay('');
      }
      
      return newSuggestions;
    });
  };

  const addTodo = () => {
    if (newTodoText.trim() !== '') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        date: dayAbbrev // Use dayAbbrev instead of selectedDay
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoText('');
      setShowInput(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingTodoId && editText.trim() !== '') {
      // Check if the todo being edited is an AI suggestion
      const isAISuggestion = aiSuggestions.some(todo => todo.id === editingTodoId);
      
      if (isAISuggestion) {
        setAiSuggestions(prev =>
          prev.map(todo =>
            todo.id === editingTodoId ? { ...todo, text: editText.trim() } : todo
          )
        );
      } else {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === editingTodoId ? { ...todo, text: editText.trim() } : todo
          )
        );
      }
      
      setEditingTodoId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTodo();
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

  // Component for a todo item without drag functionality
  const TodoItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    return (
      <div className="flex items-center mb-2 relative group">
        <input
          type="checkbox"
          id={`todo-${todo.id}`}
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
          className="mr-2.5 cursor-pointer"
          disabled={todo.isAISuggestion}
        />
        {todo.isAISuggestion ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <textarea
                value={todo.text}
                onChange={(e) => {
                  setAiSuggestions(prev =>
                    prev.map(t =>
                      t.id === todo.id ? { ...t, text: e.target.value } : t
                    )
                  );
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
                  onClick={() => approveTodo(todo.id)}
                  title="Approve"
                >
                  ✓
                </button>
                <button
                  className="text-red-400 hover:text-red-300 transition-colors"
                  onClick={() => denyTodo(todo.id)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-1">
            <label 
              htmlFor={`todo-${todo.id}`}
              className="inline-flex items-center cursor-pointer break-words text-lg"
            >
              <span 
                className={`inline-block ${
                  todo.completed ? 'line-through text-white/50' : ''
                }`}
                style={{ cursor: 'text' }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (!todo.completed) {
                    startEditing(todo);
                  }
                }}
              >
                {todo.text}
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
        )}
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

      <div className="mb-2.5">
        {filteredTodos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
      
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

export default HomeTodo; 