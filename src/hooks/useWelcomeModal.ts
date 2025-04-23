import { useState, useEffect } from 'react';
import { UserData } from '../components/WelcomeModal';

export const useWelcomeModal = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the user has completed the welcome flow before
    const hasCompletedWelcome = localStorage.getItem('hasCompletedWelcome');
    
    if (!hasCompletedWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);
  
  const completeWelcomeFlow = (userData: UserData) => {
    // Save user data to localStorage
    localStorage.setItem('userName', userData.name);
    
    // Only save vision and yearly goal if they were provided
    if (userData.vision.trim()) {
      localStorage.setItem('visionText', userData.vision);
    }
    
    if (userData.yearlyGoal.trim()) {
      localStorage.setItem('yearlyGoal', userData.yearlyGoal);
    }
    
    // Mark welcome flow as completed
    localStorage.setItem('hasCompletedWelcome', 'true');
    
    // Hide the welcome modal
    setShowWelcomeModal(false);
  };
  
  return {
    showWelcomeModal,
    completeWelcomeFlow
  };
};
