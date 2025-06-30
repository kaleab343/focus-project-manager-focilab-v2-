import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import styles from '@/styles/nav.module.css';

export const Nav: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
  return (
    <nav className={styles.nav}>
      <Link to="/" className={location.pathname === '/'? styles.activeButton : styles.button} style={{textDecoration: 'none'}}>
        Home
      </Link>
      <Link to="/planner" className={location.pathname === '/planner'? styles.activeButton : styles.button} style={{textDecoration: 'none'}}>
        Planner
      </Link>
      <Link to="/projects" className={location.pathname === '/projects'? styles.activeButton : styles.button} style={{textDecoration: 'none'}}>
        Projects
      </Link>
    </nav>
  );
};
