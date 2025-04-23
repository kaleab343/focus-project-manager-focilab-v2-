import React from 'react';
import { Routes, Route } from 'react-router-dom'
import {Home} from '@/pages/Home'
import {Projects} from '@/pages/Projects'
import {Planner} from '@/pages/Planner';
import {DailyPlanner} from '@/pages/DailyPlanner';

import { ThemeProvider } from '@/context/ThemeContext'
import { MainGoalProvider } from '@/context/MainGoalContext'
import '@/styles/themes.css'
import {WelcomeModal} from '@/components/shared/WelcomeModal';
import { useWelcomeModal } from '@/hooks/useWelcomeModal';

function App() {
  const { showWelcomeModal, completeWelcomeFlow } = useWelcomeModal();

  return (
    <ThemeProvider>
      <MainGoalProvider>
        {showWelcomeModal && <WelcomeModal onComplete={completeWelcomeFlow} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/daily" element={<DailyPlanner />} />
          <Route path="/weekly" element={<Home />} />
          <Route path="/monthly" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </MainGoalProvider>
    </ThemeProvider>
  )
}

export default App
