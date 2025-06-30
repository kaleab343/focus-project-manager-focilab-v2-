import React, { createContext, useContext, useCallback, useState } from 'react';
import { useTodos } from '../hooks/useTodos';

interface ProjectContextType {
  hideSelectedTodos: () => void;
  notifyProjectChange: () => void;
  hideWeeklyGoals: () => void;
  showWeeklyGoals: () => void;
  isWeeklyGoalsHidden: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getSelectedTodos, updateTodo } = useTodos();
  const [isWeeklyGoalsHidden, setIsWeeklyGoalsHidden] = useState(false);

  const hideSelectedTodos = useCallback(() => {
    const selectedTodos = getSelectedTodos();
    selectedTodos.forEach(todo => {
      updateTodo(todo.id, { isSelected: false });
    });
  }, [getSelectedTodos, updateTodo]);

  const hideWeeklyGoals = useCallback(() => {
    setIsWeeklyGoalsHidden(true);
  }, []);

  const showWeeklyGoals = useCallback(() => {
    setIsWeeklyGoalsHidden(false);
  }, []);

  const notifyProjectChange = useCallback(() => {
    // Hide weekly goals when project changes
    hideWeeklyGoals();
    
    // Dispatch a custom event to notify other components about project changes
    window.dispatchEvent(new CustomEvent('projectChanged', {
      detail: { timestamp: Date.now() }
    }));
  }, [hideWeeklyGoals]);

  return (
    <ProjectContext.Provider value={{ 
      hideSelectedTodos, 
      notifyProjectChange, 
      hideWeeklyGoals, 
      showWeeklyGoals,
      isWeeklyGoalsHidden 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}; 