import React, { createContext, useContext, useState } from 'react';

interface MainGoalContextType {
  mainGoal: string;
  setMainGoal: (goal: string) => void;
}

const MainGoalContext = createContext<MainGoalContextType | undefined>(undefined);

export const MainGoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mainGoal, setMainGoal] = useState<string>(() => {
    const savedGoal = localStorage.getItem('mainGoal');
    return savedGoal ? JSON.parse(savedGoal) : '';
  });

  const handleSetMainGoal = (newGoal: string) => {
    setMainGoal(newGoal);
    localStorage.setItem('mainGoal', JSON.stringify(newGoal));
  };

  return (
    <MainGoalContext.Provider value={{ mainGoal, setMainGoal: handleSetMainGoal }}>
      {children}
    </MainGoalContext.Provider>
  );
};

export const useMainGoal = () => {
  const context = useContext(MainGoalContext);
  if (!context) {
    throw new Error('useMainGoal must be used within a MainGoalProvider');
  }
  return context;
};
