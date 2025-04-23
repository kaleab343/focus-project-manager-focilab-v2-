import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export const Nav: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const navStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '20px',
    padding: '8px 12px',
    borderRadius: '30px',
    boxShadow: theme === 'dark' 
      ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
      : '0 4px 20px rgba(0, 0, 0, 0.1)',
    zIndex: 100
  };
  
  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '20px',
    border: 'none',
    background: 'transparent',
    color: theme === 'dark' ? '#ffffff' : '#333333',
    fontWeight: isActive ? 'bold' : 'normal',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  });

  return (
    <nav style={navStyle}>
      <Link to="/" style={{...buttonStyle(location.pathname === '/'), textDecoration: 'none'}}>
        Home
      </Link>
      <Link to="/planner" style={{...buttonStyle(location.pathname === '/planner'), textDecoration: 'none'}}>
        Planner
      </Link>
      <Link to="/projects" style={{...buttonStyle(location.pathname === '/projects'), textDecoration: 'none'}}>
        Projects
      </Link>
    </nav>
  );
};
