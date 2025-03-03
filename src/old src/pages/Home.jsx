import React from "react";
import Hero from "../components/Hero";
import "./Home.css";
import Slide from "../components/Slide";
export default function Home() {
  return (
    <div className="home-page">
      <Hero />
      <div className="second">
        <h2>Your Chrome Companion for Laser-Focused Productivity</h2>
        <img src="/dashboard.png" alt="dashboard" />
      </div>
      <br />
      <div className="text">
        <h2>Transform Chrome into a productivity powerhouse</h2>
        <ul>
          <li>
            Centralized Clock and Greeting: Instantly greet your day with a
            prominent clock and personalized greeting to set the tone for
            productivity.
          </li>
          <li>
            Weekly Planner: Seamlessly organize your weekly goals with a
            visually appealing planner, complete with animated UI to track your
            progress effortlessly
          </li>
          <li>
            Todo List Integration: Keep your tasks in check with our dynamic
            to-do list, seamlessly integrated with Notion for enhanced task
            management.
          </li>
          <li>
            Goal Tracking: Set your sights on success with our goal-tracking
            feature, empowering you to visualize and achieve your aspirations.
          </li>
        </ul>
      </div>
      <Slide />
    </div>
  );
}
