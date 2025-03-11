import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'

import { ThemeProvider } from './context/ThemeContext'
import { ScoreProvider } from './context/ScoreContext'
import './styles/themes.css'
import Planner from './pages/Planner';
import WelcomeModal from './components/WelcomeModal';
import { useWelcomeModal } from './hooks/useWelcomeModal';

function App() {
  const { showWelcomeModal, completeWelcomeFlow } = useWelcomeModal();

  return (
    <ThemeProvider>
      <ScoreProvider>
        {showWelcomeModal && <WelcomeModal onComplete={completeWelcomeFlow} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Planner />} />
          <Route path="/weekly" element={<Home />} />
          <Route path="/monthly" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </ScoreProvider>
    </ThemeProvider>
  )
}

export default App
