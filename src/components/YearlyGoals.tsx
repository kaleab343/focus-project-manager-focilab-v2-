import React, { useState, useEffect, KeyboardEvent } from 'react';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
}

const YearlyGoals: React.FC = () => {
  // Initialize state with localStorage data
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
    <div className="rounded-lg p-4 w-full bg-[#1A1F2E]">
      <h2 className="mt-0 mb-4 text-2xl text-white">Yearly Goals</h2>
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
        <div className="mt-2.5">
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new yearly goal..."
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

export default YearlyGoals; 