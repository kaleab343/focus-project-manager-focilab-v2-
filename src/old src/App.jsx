import React from "react";
import logo from "./logo.svg";
// import { Counter } from "./features/counter/Counter";
import "./App.css";
import { Route, Routes } from "react-router-dom";

import PricePage from "./pages/PricePage";
import Privacy from "./pages/Privacy";
import WeeklyPlanner from "./pages/WeeklyPlanner";
import ComingSoon from "./pages/ComingSoon";
import Daily from "./pages/Daily";
import Monthly from "./pages/Monthly";
import Quarterly from "./pages/Quarterly";
import Home from "./pages/Home";

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/Da" element={<Daily />} />
        <Route path="/Mo" element={<Monthly />} />
        <Route path="/Qu" element={<Quarterly />} />

        <Route path="/price" element={<PricePage />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Planner" element={<ComingSoon />} />
      </Routes>
    </div>
  );
}

export default App;
