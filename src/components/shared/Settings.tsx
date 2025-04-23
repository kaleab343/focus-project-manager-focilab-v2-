import React, { useState, useRef, useEffect } from 'react';
import { Settings2, X, Sun, Moon, RefreshCw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useMainGoal } from '@/context/MainGoalContext';

interface SettingsProps {
  // Add any props if needed
}

export const Settings: React.FC<SettingsProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { mainGoal, setMainGoal } = useMainGoal();
  const [tempGoal, setTempGoal] = useState(String(mainGoal));
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    setTempGoal(String(mainGoal));
  }, [mainGoal]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTempGoal(newValue);
    setMainGoal(newValue);
  };

  const resetWelcomeFlow = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    
    // Remove welcome flow completion flag
    localStorage.removeItem('hasCompletedWelcome');
    
    // Optionally clear other related data
    localStorage.removeItem('userName');
    
    // Reset confirmation state
    setResetConfirm(false);
    
    // Close settings
    setIsOpen(false);
    
    // Reload the page to show welcome flow
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setResetConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 p-1 rounded-full hover:opacity-70 transition-opacity duration-200"
        style={{ color: 'var(--text-primary)' }}
        aria-label="Settings"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-16 left-4 w-[400px] rounded-lg shadow-lg p-4"
          style={{ 
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setResetConfirm(false);
              }}
              className="p-1 hover:opacity-70 rounded-full transition-opacity duration-200"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Theme</span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ 
                  backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: 'var(--accent)'
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Main Goal</span>
              <input
                type="text"
                value={tempGoal}
                onChange={handleGoalChange}
                className="flex-1 ml-4 px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Welcome Flow</span>
              <button
                onClick={resetWelcomeFlow}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  resetConfirm ? 'bg-red-500 text-white' : ''
                }`}
                style={{ 
                  backgroundColor: resetConfirm 
                    ? 'rgba(239, 68, 68, 0.8)' 
                    : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  color: resetConfirm ? 'white' : 'var(--accent)'
                }}
                aria-label="Reset welcome flow"
              >
                <div className="flex items-center">
                  <RefreshCw className="w-5 h-5 mr-1" />
                  <span>{resetConfirm ? 'Confirm Reset' : 'Reset'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
