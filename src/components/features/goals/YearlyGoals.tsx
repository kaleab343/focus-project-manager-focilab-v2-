import React, { useState, useEffect, KeyboardEvent, useRef } from 'react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

// Year Progress component to show current year and progress bar
export const YearProgress: React.FC = () => {
  const [yearProgress, setYearProgress] = useState(0);
  const currentYear = new Date().getFullYear();
  
  useEffect(() => {
    // Calculate what percentage of the year has passed
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
    const endOfYear = new Date(now.getFullYear() + 1, 0, 0); // Dec 31st of current year
    
    const yearTotalMs = endOfYear.getTime() - startOfYear.getTime();
    const yearElapsedMs = now.getTime() - startOfYear.getTime();
    const progress = (yearElapsedMs / yearTotalMs) * 100;
    
    setYearProgress(progress);
  }, []);
  
  return (
    <div className="flex flex-col items-center ml-4 text-white/80">
      <span className="text-xs">{currentYear}</span>
      <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden mt-0.5 relative">
        <div 
          className="h-full bg-white/60 rounded-full" 
          style={{ width: `${yearProgress}%` }}
        ></div>
        {/* Quarter markers */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-white/40"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-white/40"></div>
        <div className="absolute top-0 left-3/4 w-px h-full bg-white/40"></div>
      </div>
    </div>
  );
};

export const YearlyGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    try {
      const storedGoals = localStorage.getItem('yearlyGoals');
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

  // Check if we have a yearly goal from the welcome flow
  useEffect(() => {
    const welcomeYearlyGoal = localStorage.getItem('yearlyGoal');
    
    // If we have a yearly goal from welcome flow and no goals yet, add it
    if (welcomeYearlyGoal && welcomeYearlyGoal.trim() !== '' && goals.length === 0) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: welcomeYearlyGoal,
        completed: false
      };
      
      setGoals([newGoal]);
      localStorage.setItem('yearlyGoals', JSON.stringify([newGoal]));
      
      // Clear the welcome yearly goal to avoid adding it again
      localStorage.removeItem('yearlyGoal');
    }
  }, [goals.length]);

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

  // Save goals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('yearlyGoals', JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goals:', error);
    }
  }, [goals]);

  const addGoal = () => {
    if (newGoalText.trim() !== '') {
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: newGoalText.trim(),
        completed: false
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

  return (
    <div className="rounded-lg p-4 w-full">
      <div className="flex items-center mb-4">
        <h2 className="mt-0 mb-0 text-2xl text-white">Yearly Goals</h2>
        <YearProgress />
      </div>
      <div className="mb-2.5">
        {goals.map(goal => (
          <div key={goal.id} className="flex items-center mb-2 relative group">
            <input
              type="checkbox"
              id={`yearly-goal-${goal.id}`}
              checked={goal.completed}
              onChange={() => toggleGoal(goal.id)}
              className="mr-2.5 cursor-pointer"
            />
            {editingGoalId === goal.id ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  maxLength={25}
                  autoFocus
                  className="w-full px-3 py-1 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
                />
                {editText.length > 20 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Keep it concise (3-4 words max)
                  </div>
                )}
              </div>
            ) : (
              <label 
                htmlFor={`yearly-goal-${goal.id}`}
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
      </div>
      
      {showInput ? (
        <div className="mt-2.5" ref={inputRef}>
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add concise goal (3-4 words)..."
            maxLength={25}
            autoFocus
            className="w-full px-3 py-2 border-none rounded bg-white/20 text-white text-sm placeholder-white/60 focus:outline-none"
          />
          {newGoalText.length > 20 && (
            <div className="text-xs text-yellow-400 mt-1">
              Keep it concise (3-4 words max)
            </div>
          )}
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
