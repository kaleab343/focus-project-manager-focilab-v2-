import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

import { ThemeProvider } from './context/ThemeContext'
import { ScoreProvider } from './context/ScoreContext'
import './styles/themes.css'
import Planner from './pages/Planner';

function App() {
  return (
    <ThemeProvider>
      <ScoreProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Planner />} />
          <Route path="/weekly" element={<Home />} />
          <Route path="/monthly" element={<Home />} />
        </Routes>
      </ScoreProvider>
    </ThemeProvider>
  )
}

export default App
