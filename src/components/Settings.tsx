import React, { useState, useRef, useEffect } from 'react';
import { Settings2, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useScore } from '../context/ScoreContext';

interface SettingsProps {
  // Add any props if needed
}

const Settings: React.FC<SettingsProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { score, setScore } = useScore();
  const [tempScore, setTempScore] = useState(String(score));

  useEffect(() => {
    setTempScore(String(score));
  }, [score]);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow any input value
    const newValue = e.target.value;
    setTempScore(newValue);
    
    // Update score immediately on every change
    // Try to parse as number if it looks like a number, otherwise keep as string
    const newScore = /^\d+$/.test(newValue) ? parseInt(newValue) : newValue;
    setScore(newScore);
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
              onClick={() => setIsOpen(false)}
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
              <span style={{ color: 'var(--text-secondary)' }}>Score</span>
              <input
                type="text"
                value={tempScore}
                onChange={handleScoreChange}
                className="flex-1 ml-4 px-2 py-1 rounded"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 