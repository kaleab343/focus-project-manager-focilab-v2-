import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { generateWeeklyGoals } from '../../utils/agets';
import { Sparkles } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isAISuggestion?: boolean;
  weekStartDate?: string;
}

const WeeklyTodo: React.FC = () => {
  // Get the current week's start and end dates
  const getWeekDates = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mondayDate: monday.toISOString().split('T')[0]
    };
  };

  // Initialize state with localStorage data
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const storedTodos = localStorage.getItem('weeklyTodos');
      const parsedTodos = storedTodos ? JSON.parse(storedTodos) : [];
      const { mondayDate } = getWeekDates();
      
      // Only return todos from the current week
      return parsedTodos.filter((todo: Todo) => todo.weekStartDate === mondayDate);
    } catch (error) {
      console.error('Error loading initial todos:', error);
      return [];
    }
  });
  const [showInput, setShowInput] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Todo[]>([]);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);

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

  // Check for week change and reset todos if needed
  useEffect(() => {
    const checkWeekChange = () => {
      const { mondayDate } = getWeekDates();
      const storedTodos = localStorage.getItem('weeklyTodos');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        // Filter out todos from previous weeks
        const currentWeekTodos = parsedTodos.filter((todo: Todo) => todo.weekStartDate === mondayDate);
        if (currentWeekTodos.length !== parsedTodos.length) {
          setTodos(currentWeekTodos);
          localStorage.setItem('weeklyTodos', JSON.stringify(currentWeekTodos));
        }
      }
    };

    // Check on mount and set up interval
    checkWeekChange();
    const interval = setInterval(checkWeekChange, 1000 * 60 * 60); // Check every hour

    return () => clearInterval(interval);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('weeklyTodos', JSON.stringify(todos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodoText.trim() !== '') {
      const { mondayDate } = getWeekDates();
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        weekStartDate: mondayDate
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
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === editingTodoId ? { ...todo, text: editText.trim() } : todo
        )
      );
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

  // Generate weekly goals using AI
  const generateTodos = async () => {
    try {
      setIsGenerating(true);
      
      // Get vision, yearly goals, and quarterly goals from localStorage
      const vision = localStorage.getItem('visionText') || '';
      const yearlyGoals = JSON.parse(localStorage.getItem('yearlyGoals') || '[]')
        .filter((goal: { completed: boolean }) => !goal.completed)
        .map((goal: { text: string }) => goal.text);
      const quarterlyGoals = JSON.parse(localStorage.getItem('quarterlyGoals') || '[]')
        .filter((goal: { completed: boolean }) => !goal.completed)
        .map((goal: { text: string }) => goal.text);
      
      // Check if we have enough context to generate goals
      if (!vision && yearlyGoals.length === 0 && quarterlyGoals.length === 0) {
        alert('Please add a vision statement, yearly goals, or quarterly goals to generate weekly goals.');
        setIsGenerating(false);
        return;
      }
      
      // Generate weekly goals
      const generatedGoals = await generateWeeklyGoals({ vision, yearlyGoals, quarterlyGoals });
      
      // Add generated goals to AI suggestions
      if (generatedGoals.length > 0) {
        const newSuggestions = generatedGoals.map(goal => ({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          text: goal.text,
          completed: false,
          isAISuggestion: true
        }));
        
        setAiSuggestions(newSuggestions);
        setHasGeneratedSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating weekly goals:', error);
      alert('Failed to generate weekly goals. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to approve an AI suggestion
  const approveTodo = (id: string) => {
    // Find the todo in AI suggestions
    const approvedTodo = aiSuggestions.find(todo => todo.id === id);
    if (approvedTodo) {
      // Add to regular todos without AI flag
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

  // Function to deny/remove an AI suggestion
  const denyTodo = (id: string) => {
    // Simply remove from AI suggestions
    setAiSuggestions(prev => {
      const newSuggestions = prev.filter(todo => todo.id !== id);
      
      // If this was the last AI suggestion, reset the generation flag
      if (newSuggestions.length === 0) {
        setHasGeneratedSuggestions(false);
      }
      
      return newSuggestions;
    });
  };

  return (
    <div className="rounded-lg p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="mt-0 text-2xl text-white">Weekly Goals</h2>
         
        </div>
        <button
          onClick={generateTodos}
          disabled={isGenerating}
          className="flex items-center justify-center px-2 py-1 rounded-sm bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate goals with AI"
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center">
              <Sparkles className="h-4 w-4 mr-1" />
              Generate
            </span>
          )}
        </button>
      </div>

      {/* AI Suggestions Section */}
      {aiSuggestions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg text-white/80 mb-2 flex items-center">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Suggestions
          </h3>
          <div className="mb-2.5 space-y-2">
            {aiSuggestions.map(todo => (
              <div key={todo.id} className="flex items-center p-2 bg-white/5 rounded-md group">
                <textarea
                  value={todo.text}
                  readOnly
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
                  rows={1}
                />
                <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                  <span className="text-sm">✨</span> AI
                </span>
                <div className="flex items-center gap-2 ml-2">
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
            ))}
          </div>
        </div>
      )}
      
      {/* Regular Todos Section */}
      <div className="mb-2.5">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center mb-2 relative group">
            <input
              type="checkbox"
              id={`weekly-todo-${todo.id}`}
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-2.5 cursor-pointer"
            />
            {editingTodoId === todo.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
                className="flex-1 px-3 py-1 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
              />
            ) : (
              <label 
                htmlFor={`weekly-todo-${todo.id}`}
                className={`inline-flex items-center cursor-pointer break-words text-lg ${
                  todo.completed ? 'line-through text-white/50' : ''
                }`}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  if (!todo.completed) {
                    startEditing(todo);
                  }
                }}
              >
                {todo.text}
                <button 
                  className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteTodo(todo.id);
                  }}
                >
                  ×
                </button>
              </label>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Todo Input */}
      {showInput ? (
        <div className="mt-2.5" ref={inputRef}>
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new weekly goal..."
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

export default WeeklyTodo; 