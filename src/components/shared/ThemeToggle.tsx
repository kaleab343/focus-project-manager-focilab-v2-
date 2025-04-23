import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full transition-all duration-300 ease-in-out"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        border: '2px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="w-6 h-6 flex items-center justify-center text-xl">
        {theme === 'light' ? '🌙' : '☀️'}
      </div>
    </button>
  );
};
