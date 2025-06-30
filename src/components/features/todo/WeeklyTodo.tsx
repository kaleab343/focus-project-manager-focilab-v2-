import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { generateWeeklyGoals } from '@/utils/agents';
import { Sparkles } from 'lucide-react';
import { Project } from '@/hooks/useProjects';
import { useProjectContext } from '@/context/ProjectContext';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  isAISuggestion?: boolean;
  weekStartDate?: string;
  projectId?: string;
}

export interface WeeklyTodoProps {
  project?: Project;
}

export const WeeklyTodo: React.FC<WeeklyTodoProps> = ({ project }) => {
  const { hideSelectedTodos, isWeeklyGoalsHidden, showWeeklyGoals } = useProjectContext();

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
  const [isGeneratingSpecificTodos, setIsGeneratingSpecificTodos] = useState(false);

  // Show weekly goals when project is available and goals are hidden
  useEffect(() => {
    if (project && isWeeklyGoalsHidden) {
      showWeeklyGoals();
    }
  }, [project, isWeeklyGoalsHidden, showWeeklyGoals]);

  // Show weekly goals when we're on the Planner page and there's a current work project
  useEffect(() => {
    if (project && project.isCurrentWork) {
      showWeeklyGoals();
    }
  }, [project, showWeeklyGoals]);

  // Listen for project changes and hide selected todos
  useEffect(() => {
    const handleProjectChange = () => {
      hideSelectedTodos();
    };

    window.addEventListener('projectChanged', handleProjectChange);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange);
    };
  }, [hideSelectedTodos]);

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
      const storedTodos = localStorage.getItem('weeklyTodos');
      const parsedTodos = storedTodos ? JSON.parse(storedTodos) : [];
      const { mondayDate } = getWeekDates();
      // Replace current week todos with updated ones
      const otherWeekTodos = parsedTodos.filter((todo: Todo) => todo.weekStartDate !== mondayDate);
      const allTodos = [...otherWeekTodos, ...todos];
      localStorage.setItem('weeklyTodos', JSON.stringify(allTodos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  }, [todos]);

  // Rename the local addTodo to addWeeklyTodo
  const addWeeklyTodo = () => {
    if (newTodoText.trim() !== '' && todos.length < 5) {
      const { mondayDate } = getWeekDates();
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        weekStartDate: mondayDate,
        projectId: project?.id
      };
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodoText('');
      setShowInput(false);
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const updatedTodos = todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      setTodos(updatedTodos);
      
      // Dispatch custom event when a todo is checked/unchecked
      window.dispatchEvent(new CustomEvent('weeklyTodoToggled', {
        detail: { completed: !todo.completed, text: todo.text }
      }));
    }
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(t => t.id !== id);
    setTodos(updatedTodos);
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editingTodoId && editText.trim() !== '') {
      const updatedTodos = todos.map(t =>
        t.id === editingTodoId ? { ...t, text: editText.trim() } : t
      );
      setTodos(updatedTodos);
      setEditingTodoId(null);
      setEditText('');
    }
  };

  // Update usages of addTodo to addWeeklyTodo for weekly todos
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addWeeklyTodo();
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
      let vision = '';
      let yearlyGoals: string[] = [];
      let quarterlyGoals: string[] = [];
      let promptContext = '';
      // If project is provided, use its title and description as context
      if (project) {
        promptContext = `Project Title: ${project.title}\nProject Description: ${project.description || ''}`;
        vision = project.title;
        yearlyGoals = [project.description || ''];
      } else {
        vision = localStorage.getItem('visionText') || '';
        yearlyGoals = JSON.parse(localStorage.getItem('yearlyGoals') || '[]')
          .filter((goal: { completed: boolean }) => !goal.completed)
          .map((goal: { text: string }) => goal.text);
        quarterlyGoals = JSON.parse(localStorage.getItem('quarterlyGoals') || '[]')
          .filter((goal: { completed: boolean }) => !goal.completed)
          .map((goal: { text: string }) => goal.text);
      }
      // Debug log
      console.log('WEEKLY TODO PROJECT:', project);
      // Check if we have enough context to generate goals
      if (project && !project.title && !project.description) {
        alert('Please provide a project title and description to generate weekly goals.');
        setIsGenerating(false);
        return;
      }
      if (!vision && yearlyGoals.length === 0 && quarterlyGoals.length === 0) {
        alert('Please add a vision statement, yearly goals, or quarterly goals to generate weekly goals.');
        setIsGenerating(false);
        return;
      }
      // Generate weekly goals
      let generatedGoals = await generateWeeklyGoals({ vision: promptContext || vision, yearlyGoals, quarterlyGoals }, project);
      // Limit to 5 generated todos
      generatedGoals = generatedGoals.slice(0, 5);
      // Add generated goals to AI suggestions
      if (generatedGoals.length > 0) {
        const { mondayDate } = getWeekDates();
        const newSuggestions = generatedGoals.map((goal: { text: string }) => ({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          text: goal.text,
          completed: false,
          isAISuggestion: true,
          weekStartDate: mondayDate,
          projectId: project?.id
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
    if (todos.length >= 5) return;
    // Find the todo in AI suggestions
    const approvedTodo = aiSuggestions.find(todo => todo.id === id);
    if (approvedTodo) {
      // Add to regular todos without AI flag
      const regularTodo = {
        ...approvedTodo,
        isAISuggestion: false
      };
      // Add to permanent todos only if not already present
      setTodos(prevTodos => {
        if (prevTodos.some(t => t.text === approvedTodo.text)) return prevTodos;
        return [...prevTodos, regularTodo];
      });
      // Do NOT remove from aiSuggestions
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

  // Placeholder for AI overlay click
  const handleAiClick = async (todo: Todo) => {
    if (todos.length >= 5) return;
    
    try {
      setIsGeneratingSpecificTodos(true);
      
      // Dispatch a specific event for the daily todo component to handle
      window.dispatchEvent(new CustomEvent('generateSpecificDailyTodos', {
        detail: { 
          weeklyTodoText: todo.text,
          projectId: todo.projectId,
          project: project
        }
      }));
      
      // Show a success message
      console.log(`Requesting specific daily todos for: ${todo.text}`);
      
    } catch (error) {
      console.error('Error requesting specific daily todos:', error);
    } finally {
      setIsGeneratingSpecificTodos(false);
    }
  };

  // Wrap deleteTodo to auto-refill todos up to 5
  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
    setTimeout(() => {
      const updatedTodos = todos.filter(t => t.id !== id);
      let fillCount = 5 - updatedTodos.length;
      if (fillCount > 0 && aiSuggestions.length > 0) {
        aiSuggestions
          .filter(s => !updatedTodos.some(t => t.text === s.text))
          .slice(0, fillCount)
          .forEach(suggestion => {
            approveTodo(suggestion.id);
          });
      } else if (fillCount > 0 && !isGenerating && !hasGeneratedSuggestions) {
        generateTodos();
      }
    }, 100);
  };

  return (
    <div className={`rounded-lg p-4 w-full transition-opacity duration-300 ${isWeeklyGoalsHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
            {aiSuggestions.slice(0, 5).map(todo => {
              // Determine if this suggestion has already been approved (exists in regularTodos)
              const isApproved = todos.some(t => t.text === todo.text);
              // Count how many AI suggestions are approved (in regularTodos)
              const approvedCount = aiSuggestions.filter(s => todos.some(t => t.text === s.text)).length;
              // Only allow checking if less than 5 are approved, or if this one is already approved
              const disableCheckbox = !isApproved && approvedCount >= 5;
              return (
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
                    <input
                      type="checkbox"
                      checked={isApproved}
                      disabled={disableCheckbox}
                      onChange={() => {
                        if (!isApproved) approveTodo(todo.id);
                        else {
                          // Remove from regular todos if unchecked
                          const todoToRemove = todos.find(t => t.text === todo.text);
                          if (todoToRemove) {
                            deleteTodo(todoToRemove.id);
                          }
                        }
                      }}
                      title={disableCheckbox ? "You can only approve up to 5 suggestions" : (isApproved ? "Unapprove" : "Approve")}
                      className="accent-green-400 w-4 h-4 cursor-pointer"
                    />
                    <button
                      className="text-red-400 hover:text-red-300 transition-colors"
                      onClick={() => denyTodo(todo.id)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Regular Todos Section */}
      <div className="mb-2.5">
        {todos.slice(0, 5).map(todo => (
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
              <>
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
                  style={{ width: '100%' }}
                >
                  {todo.text}
                </label>
                {/* X (delete) button at top right */}
                <button
                  className="absolute top-0 right-0 bg-transparent border-none text-white/70 text-2xl cursor-pointer p-2 opacity-90 hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteTodo(todo.id);
                  }}
                  title="Delete todo"
                  style={{ top: '0px', right: '0px' }}
                >
                  ×
                </button>
                {/* AI Overlay Button at bottom right */}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 mb-1 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full p-1.5 flex items-center justify-center z-10 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate specific daily todos for this weekly goal"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAiClick(todo);
                  }}
                  disabled={isGeneratingSpecificTodos}
                  style={{ pointerEvents: 'auto', bottom: '0px', right: '12px' }}
                >
                  {isGeneratingSpecificTodos ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </button>
              </>
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
