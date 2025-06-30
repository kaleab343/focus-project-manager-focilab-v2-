import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles } from 'lucide-react';
import { generateSpecificDailyTodos, generateProjectDailyTodos } from '@/utils/agents';
import { useTodos, Todo } from '@/hooks/useTodos';
import { useProjects } from '@/hooks/useProjects';
import { useProjectContext } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';

interface DailyTodoProps {
  selectedWeeklyTodo?: string;
  onTodoComplete?: (todoId: string) => void;
}

const DailyTodo: React.FC<DailyTodoProps> = ({ selectedWeeklyTodo, onTodoComplete }) => {
  const { hideSelectedTodos, isWeeklyGoalsHidden, showWeeklyGoals } = useProjectContext();
  const [newTodo, setNewTodo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedWeeklyTodoForAI, setSelectedWeeklyTodoForAI] = useState<string | null>(null);
  const { 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    todos: allTodos, 
    toggleSelectedTodo, 
    getSelectedTodos 
  } = useTodos();
  const { projects } = useProjects();
  const isUpdatingRef = useRef(false);
  
  // Get current work project
  const currentWorkProject = projects.find(project => project.isCurrentWork);

  // Get today's date
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Get todos for today and selected todos from IndexedDB
  const todayTodos = allTodos.filter(todo => todo.date === today);
  const selectedTodos = getSelectedTodos();
  const activeTodos = todayTodos.filter(todo => !todo.isSelected);

  // Show selected todos when project is available and goals are hidden
  useEffect(() => {
    if (currentWorkProject && isWeeklyGoalsHidden) {
      showWeeklyGoals();
    }
  }, [currentWorkProject, isWeeklyGoalsHidden, showWeeklyGoals]);

  // Show selected todos when we're on the Planner page and there's a current work project
  useEffect(() => {
    if (currentWorkProject && currentWorkProject.isCurrentWork) {
      showWeeklyGoals();
    }
  }, [currentWorkProject, showWeeklyGoals]);

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

  // Listen for specific weekly todo selection from AI symbol
  useEffect(() => {
    const handleSpecificDailyTodos = (event: CustomEvent) => {
      const { weeklyTodoText } = event.detail;
      setSelectedWeeklyTodoForAI(weeklyTodoText);
      
      // Clear existing active todos for today and generate specific ones
      activeTodos.forEach(todo => {
        deleteTodo(todo.id);
      });
      
      // Generate specific todos for the selected weekly todo
      generateSpecificTodosForWeeklyTodo(weeklyTodoText);
    };

    window.addEventListener('generateSpecificDailyTodos', handleSpecificDailyTodos as EventListener);
    
    return () => {
      window.removeEventListener('generateSpecificDailyTodos', handleSpecificDailyTodos as EventListener);
    };
  }, [activeTodos, deleteTodo]);

  // Generate daily todos when component mounts or when selectedWeeklyTodo changes
  useEffect(() => {
    // Only generate new todos if there are no existing todos for today
    if (todayTodos.length === 0) {
      if (selectedWeeklyTodo) {
        generateTodosForWeeklyTodo(selectedWeeklyTodo);
      } else if (currentWorkProject && !selectedWeeklyTodoForAI) {
        // Generate project-specific daily todos when no weekly todo is selected
        generateProjectDailyTodosLocal();
      }
    }
  }, [selectedWeeklyTodo, currentWorkProject, selectedWeeklyTodoForAI, todayTodos.length]);

  const generateSpecificTodosForWeeklyTodo = async (weeklyTodoTitle: string) => {
    setIsGenerating(true);
    try {
      const generatedTodos = await generateSpecificDailyTodos(weeklyTodoTitle, {
        vision: '',
        yearlyGoals: [],
        quarterlyGoals: [],
        weeklyGoals: []
      });
      
      // Convert TodoItemType to Todo and add to IndexedDB
      const convertedTodos: Todo[] = generatedTodos.map(todo => ({
        ...todo,
        status: 'not-started' as 'not-started' | 'in-progress' | 'completed',
        date: today,
        isSelected: false
      }));
      
      // Add new todos to IndexedDB
      convertedTodos.forEach(todo => addTodo(todo));
      
      // Update local state
      setSelectedWeeklyTodoForAI(null);
    } catch (error) {
      console.error('Error generating specific daily todos:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTodosForWeeklyTodo = async (weeklyTodoTitle: string) => {
    setIsGenerating(true);
    try {
      const generatedTodos = await generateSpecificDailyTodos(weeklyTodoTitle, {
        vision: '',
        yearlyGoals: [],
        quarterlyGoals: [],
        weeklyGoals: []
      });
      
      // Convert TodoItemType to Todo
      const convertedTodos: Todo[] = generatedTodos.map(todo => ({
        ...todo,
        status: 'not-started' as 'not-started' | 'in-progress' | 'completed',
        date: today,
        isSelected: false
      }));
      
      // Add new todos to IndexedDB
      convertedTodos.forEach(todo => addTodo(todo));
      
      // Update local state
      setSelectedWeeklyTodoForAI(null);
    } catch (error) {
      console.error('Error generating daily todos:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateProjectDailyTodosLocal = async () => {
    if (!currentWorkProject) return;
    
    setIsGenerating(true);
    try {
      const generatedTodos = await generateProjectDailyTodos(currentWorkProject);
      
      // Convert TodoItemType to Todo
      const convertedTodos: Todo[] = generatedTodos.map(todo => ({
        ...todo,
        status: 'not-started' as 'not-started' | 'in-progress' | 'completed',
        date: today,
        projectId: currentWorkProject.id,
        isSelected: false
      }));
      
      // Add new project-based todos to IndexedDB
      convertedTodos.forEach(todo => addTodo(todo));
      
      // Update local state
      setSelectedWeeklyTodoForAI(null);
    } catch (error) {
      console.error('Error generating project daily todos:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToProjectGeneration = () => {
    setSelectedWeeklyTodoForAI(null);
    
    // Delete active todos for today
    activeTodos.forEach(todo => {
      deleteTodo(todo.id);
    });
    
    // Generate project-based todos
    if (currentWorkProject) {
      generateProjectDailyTodosLocal();
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        title: newTodo.trim(),
        status: 'not-started' as const,
        date: today,
        isSelected: false
      };
      
      // Add to IndexedDB
      addTodo(todo);
      setNewTodo('');
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    isUpdatingRef.current = true;
    
    // Find the todo in active todos
    const todoInActive = activeTodos.find(todo => todo.id === todoId);
    if (todoInActive) {
      // When checking a todo, mark it as selected
      await toggleSelectedTodo(todoId);
      onTodoComplete?.(todoId);
      return;
    }
    
    // Find the todo in selected todos
    const todoInSelected = selectedTodos.find(todo => todo.id === todoId);
    if (todoInSelected) {
      // When checking a selected todo, toggle its strikethrough status
      const newStatus = todoInSelected.status === 'completed' ? 'in-progress' as const : 'completed' as const;
      await updateTodo(todoId, { status: newStatus });
      onTodoComplete?.(todoId);
    }
  };

  const handleDeleteTodo = (todoId: string) => {
    // Delete from IndexedDB
    deleteTodo(todoId);
  };

  const selectedCount = selectedTodos.length;
  const totalCount = activeTodos.length + selectedTodos.length;

  return (
    <div className={`rounded-lg p-4 w-full transition-opacity duration-300 ${isWeeklyGoalsHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="mt-0 text-2xl text-white">
            Daily Tasks
          </h2>
          {selectedWeeklyTodoForAI && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                ✨ {selectedWeeklyTodoForAI.length > 30 ? selectedWeeklyTodoForAI.substring(0, 30) + '...' : selectedWeeklyTodoForAI}
              </span>
              <button
                onClick={resetToProjectGeneration}
                className="text-xs text-gray-400 hover:text-white transition-colors"
                title="Reset to project-based generation"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {selectedCount}/{totalCount}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedWeeklyTodoForAI) {
                  generateSpecificTodosForWeeklyTodo(selectedWeeklyTodoForAI);
                } else if (selectedWeeklyTodo) {
                  generateTodosForWeeklyTodo(selectedWeeklyTodo);
                } else if (currentWorkProject) {
                  generateProjectDailyTodosLocal();
                }
              }}
              disabled={isGenerating}
              className="h-8 w-8 p-0 text-white hover:bg-gray-700"
            >
              <Sparkles className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Active Todos Section */}
      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        {activeTodos.length === 0 ? (
          <div className="text-white/40 text-sm italic">
            No active tasks for today. Use the sparkle button to generate tasks.
          </div>
        ) : (
          activeTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center mb-2 relative group"
            >
              <input
                type="checkbox"
                id={`active-todo-${todo.id}`}
                checked={false}
                onChange={() => handleToggleTodo(todo.id)}
                className="mr-2.5 cursor-pointer"
              />
              <div className="flex items-center justify-between flex-1">
                <label 
                  htmlFor={`active-todo-${todo.id}`}
                  className="inline-flex items-center cursor-pointer break-words text-lg"
                >
                  <span className="inline-block text-white/70">
                    {todo.title}
                  </span>
                </label>
                <button 
                  className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                  onClick={() => handleDeleteTodo(todo.id)}
                  title="Remove this task"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Todo */}
      <div className="flex items-center space-x-2 mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddTodo}
          disabled={!newTodo.trim()}
          className="h-8 w-8 p-0 text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent border-none text-white placeholder-white/40 focus:outline-none"
        />
      </div>
      
      {/* Selected Todos Section - Always Visible */}
      <div className="mt-6">
        <h3 className="text-lg text-white/80 mb-3 flex items-center gap-2">
          <span className="text-emerald-400">✓</span>
          Selected Tasks ({selectedTodos.length})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {selectedTodos.length === 0 ? (
            <div className="text-white/40 text-sm italic">
              No tasks selected yet. Check off tasks above to add them here.
            </div>
          ) : (
            selectedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center mb-2 relative group"
              >
                <input
                  type="checkbox"
                  id={`selected-todo-${todo.id}`}
                  checked={todo.status === 'completed'}
                  onChange={() => handleToggleTodo(todo.id)}
                  className="mr-2.5 cursor-pointer"
                />
                <div className="flex items-center justify-between flex-1">
                  <label 
                    htmlFor={`selected-todo-${todo.id}`}
                    className="inline-flex items-center cursor-pointer break-words text-lg"
                  >
                    <span className={`inline-block text-white/70 ${
                      todo.status === 'completed' ? 'line-through text-white/50' : ''
                    }`}>
                      {todo.title}
                    </span>
                  </label>
                  <button 
                    className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                    onClick={() => handleDeleteTodo(todo.id)}
                    title="Remove this task"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {isGenerating && (
        <div className="text-center text-gray-400 text-sm py-4">
          Generating daily tasks...
        </div>
      )}
    </div>
  );
};

export default DailyTodo;
