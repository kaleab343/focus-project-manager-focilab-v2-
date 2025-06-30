import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';
import { generateQuarterlyGoals } from '@/utils/agents';
import { Sparkles, Calendar, Target } from 'lucide-react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  quarter: number;
  step?: number; // Step number within the quarter (1-4)
}

export const QuarterlyGoals: React.FC = () => {
  // Get current quarter (1-4)
  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    return Math.floor(month / 3) + 1;
  };

  const [currentQuarter, setCurrentQuarter] = useState<number>(getCurrentQuarter());
  const actualCurrentQuarter = getCurrentQuarter();
  
  // Initialize state with localStorage data
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const storedGoals = localStorage.getItem('quarterlyGoals');
      return storedGoals ? JSON.parse(storedGoals) : [];
    } catch (error) {
      console.error('Error loading initial goals:', error);
      return [];
    }
  });
  const [showInput, setShowInput] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAllQuarters, setShowAllQuarters] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowInput(false);
        setNewGoalText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter goals for current quarter
  const filteredGoals = goals.filter(goal => goal.quarter === currentQuarter);

  // Get goals for a specific quarter
  const getGoalsForQuarter = (quarter: number) => {
    return goals.filter(goal => goal.quarter === quarter).sort((a, b) => (a.step || 0) - (b.step || 0));
  };

  // Save goals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('quarterlyGoals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }, [goals]);

  const addGoal = () => {
    if (newGoalText.trim() !== '') {
      const quarterGoals = getGoalsForQuarter(currentQuarter);
      const nextStep = quarterGoals.length + 1;
      
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        completed: false,
        quarter: currentQuarter,
        step: nextStep
      };
      setGoals(prevGoals => [...prevGoals, newGoal]);
      setNewGoalText('');
      setShowInput(false);
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(prevGoals =>
      prevGoals.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== id));
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditText(goal.text);
  };

  const saveEdit = () => {
    if (editingGoalId && editText.trim() !== '') {
      setGoals(prevGoals =>
        prevGoals.map(goal =>
          goal.id === editingGoalId ? { ...goal, text: editText.trim() } : goal
        )
      );
      setEditingGoalId(null);
      setEditText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addGoal();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewGoalText('');
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditingGoalId(null);
      setEditText('');
    }
  };

  // Generate complete yearly plan with 4 steps for each quarter
  const generateYearlyPlan = async () => {
    try {
      setIsGenerating(true);
      
      // Get vision and yearly goals from localStorage
      const vision = localStorage.getItem('visionText') || '';
      const yearlyGoals = JSON.parse(localStorage.getItem('yearlyGoals') || '[]')
        .filter((goal: { completed: boolean }) => !goal.completed)
        .map((goal: { text: string }) => goal.text);
      
      // Check if we have enough context to generate goals
      if (!vision && yearlyGoals.length === 0) {
        alert('Please add a vision statement and at least one yearly goal to generate the yearly plan.');
        setIsGenerating(false);
        return;
      }
      
      // Clear existing quarterly goals
      setGoals([]);
      
      // Generate goals for each quarter
      const allNewGoals: Goal[] = [];
      
      for (let quarter = 1; quarter <= 4; quarter++) {
        try {
          const generatedGoals = await generateQuarterlyGoals({ 
            vision, 
            yearlyGoals,
            quarter // Pass quarter context
          });
          
          // Add generated goals to the quarter with step numbers
          if (generatedGoals.length > 0) {
            const quarterGoals = generatedGoals.slice(0, 4).map((goal, index) => ({
              id: Date.now() + Math.random().toString(36).substring(2, 9) + quarter + index,
              text: goal.text,
              completed: false,
              quarter: quarter,
              step: index + 1
            }));
            
            allNewGoals.push(...quarterGoals);
          }
        } catch (error) {
          console.error(`Error generating goals for Q${quarter}:`, error);
        }
      }
      
      // Set all goals at once
      setGoals(allNewGoals);
      
    } catch (error) {
      console.error('Error generating yearly plan:', error);
      alert('Failed to generate yearly plan. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate quarterly goals using AI (existing function)
  const generateGoals = async () => {
    try {
      setIsGenerating(true);
      
      // Get vision and yearly goals from localStorage
      const vision = localStorage.getItem('visionText') || '';
      const yearlyGoals = JSON.parse(localStorage.getItem('yearlyGoals') || '[]')
        .filter((goal: { completed: boolean }) => !goal.completed)
        .map((goal: { text: string }) => goal.text);
      
      // Check if we have enough context to generate goals
      if (!vision && yearlyGoals.length === 0) {
        alert('Please add a vision statement and at least one yearly goal to generate quarterly goals.');
        setIsGenerating(false);
        return;
      }
      
      // Generate quarterly goals
      const generatedGoals = await generateQuarterlyGoals({ vision, yearlyGoals });
      
      // Add generated goals to the current quarter
      if (generatedGoals.length > 0) {
        const quarterGoals = getGoalsForQuarter(currentQuarter);
        const nextStep = quarterGoals.length + 1;
        
        const newGoals = generatedGoals.slice(0, 4 - quarterGoals.length).map((goal, index) => ({
          id: Date.now() + Math.random().toString(36).substring(2, 9),
          text: goal.text,
          completed: false,
          quarter: currentQuarter,
          step: nextStep + index
        }));
        
        setGoals(prevGoals => [...prevGoals, ...newGoals]);
      }
    } catch (error) {
      console.error('Error generating quarterly goals:', error);
      alert('Failed to generate quarterly goals. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuarterGoals = (quarter: number) => {
    const quarterGoals = getGoalsForQuarter(quarter);
    const quarterNames = ['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];
    
    return (
      <div key={quarter} className={`${showAllQuarters ? 'mb-6' : ''}`}>
        {showAllQuarters && (
          <h3 className={`text-lg font-medium mb-3 ${
            quarter === actualCurrentQuarter ? 'text-emerald-400' : 'text-white'
          }`}>
            {quarterNames[quarter - 1]}
          </h3>
        )}
        
        <div className="space-y-2">
          {quarterGoals.map(goal => (
            <div key={goal.id} className="flex items-center mb-2 relative group">
              <div className="flex items-center mr-2">
                <span className="text-xs text-gray-400 mr-2 w-4 text-center">
                  {goal.step || ''}
                </span>
                <input
                  type="checkbox"
                  id={`quarterly-goal-${goal.id}`}
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="cursor-pointer"
                />
              </div>
              {editingGoalId === goal.id ? (
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
                  htmlFor={`quarterly-goal-${goal.id}`}
                  className={`inline-flex items-center cursor-pointer break-words text-sm ${
                    goal.completed ? 'line-through text-white/50' : ''
                  }`} 
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    if (!goal.completed) {
                      startEditing(goal);
                    }
                  }}
                >
                  {goal.text}
                  <button 
                    className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteGoal(goal.id);
                    }}
                  >
                    ×
                  </button>
                </label>
              )}
            </div>
          ))}
          
          {/* Add empty slots for missing steps */}
          {quarterGoals.length < 4 && showAllQuarters && (
            <div className="text-gray-500 text-xs italic ml-6">
              {4 - quarterGoals.length} step{4 - quarterGoals.length !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h2 className="mt-0 text-2xl text-white">
            {showAllQuarters ? 'Yearly Plan' : `Q${currentQuarter} Goals`}
          </h2>
          <button
            onClick={() => setShowAllQuarters(!showAllQuarters)}
            className="flex items-center px-2 py-1 rounded-sm bg-gray-700 text-white hover:bg-gray-600 text-sm"
            title={showAllQuarters ? 'Show current quarter only' : 'Show all quarters'}
          >
            {showAllQuarters ? <Target className="h-4 w-4 mr-1" /> : <Calendar className="h-4 w-4 mr-1" />}
            {showAllQuarters ? 'Quarter View' : 'Year View'}
          </button>
        </div>
        
        <div className="flex space-x-2">
          {!showAllQuarters && (
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map(quarter => (
                <button
                  key={quarter}
                  onClick={() => setCurrentQuarter(quarter)}
                  className={`w-8 h-8 flex items-center justify-center rounded-sm text-sm ${
                    quarter === currentQuarter 
                      ? 'bg-emerald-700 text-white' 
                      : 'bg-[#0B0F17] text-gray-400 hover:text-white'
                  } ${quarter === actualCurrentQuarter ? 'border-1 border-white' : ''}`}
                >
                  Q{quarter}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={generateYearlyPlan}
              disabled={isGenerating}
              className="flex items-center justify-center px-3 py-1 rounded-sm bg-blue-700 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Generate complete yearly plan"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Planning...
                </span>
              ) : (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Year Plan
                </span>
              )}
            </button>
            
            {!showAllQuarters && (
              <button
                onClick={generateGoals}
                disabled={isGenerating}
                className="flex items-center justify-center px-2 py-1 rounded-sm bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Generate goals for current quarter"
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
            )}
          </div>
        </div>
      </div>
      
      {showAllQuarters ? (
        // Show all quarters
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(quarter => renderQuarterGoals(quarter))}
        </div>
      ) : (
        // Show current quarter only
        <div className="mb-2.5">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="flex items-center mb-2 relative group">
              <div className="flex items-center mr-2">
                <span className="text-xs text-gray-400 mr-2 w-4 text-center">
                  {goal.step || ''}
                </span>
                <input
                  type="checkbox"
                  id={`quarterly-goal-${goal.id}`}
                  checked={goal.completed}
                  onChange={() => toggleGoal(goal.id)}
                  className="mr-2.5 cursor-pointer"
                />
              </div>
              {editingGoalId === goal.id ? (
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
                  htmlFor={`quarterly-goal-${goal.id}`}
                  className={`inline-flex items-center cursor-pointer break-words text-lg ${
                    goal.completed ? 'line-through text-white/50' : ''
                  }`} 
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    if (!goal.completed) {
                      startEditing(goal);
                    }
                  }}
                >
                  {goal.text}
                  <button 
                    className="bg-transparent border-none text-white/50 text-lg cursor-pointer px-1.5 ml-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-400 inline-flex items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteGoal(goal.id);
                    }}
                  >
                    ×
                  </button>
                </label>
              )}
            </div>
          ))}
          
          {/* Show remaining steps indicator */}
          {filteredGoals.length < 4 && (
            <div className="text-gray-500 text-sm italic ml-6 mt-2">
              {4 - filteredGoals.length} step{4 - filteredGoals.length !== 1 ? 's' : ''} remaining for Q{currentQuarter}
            </div>
          )}
        </div>
      )}
      
      {!showAllQuarters && (
        showInput ? (
          <div className="mt-2.5" ref={inputRef}>
            <input
              type="text"
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Add step ${filteredGoals.length + 1} for Q${currentQuarter}...`}
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
        )
      )}
    </div>
  );
};
