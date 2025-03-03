import React, { createContext, useContext, useState, useEffect } from 'react';

interface ScoreContextType {
  score: any;
  setScore: (score: any) => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [score, setScore] = useState(() => {
    const savedScore = localStorage.getItem('userScore');
    return savedScore ? JSON.parse(savedScore) : 100000;
  });

  useEffect(() => {
    localStorage.setItem('userScore', JSON.stringify(score));
  }, [score]);

  return (
    <ScoreContext.Provider value={{ score, setScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => {
  const context = useContext(ScoreContext);
  if (context === undefined) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return context;
}; 