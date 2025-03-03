import React, { useEffect, useState } from "react";
import Todo from "../components/Todo";
import "./Daily.css";
import ThemeMode from "../components/weekly/ThemeMode";
import { Link } from "react-router-dom";

export default function Daily() {
  const getDayName = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    return days[today];
  };

  const [brainDump, setBrainDump] = useState("");
  const [morningGratitude, setMorningGratitude] = useState("•\n•\n•\n•");
  const [nightGratitude, setNightGratitude] = useState("•\n•\n•\n•");
  const [lastSavedDate, setLastSavedDate] = useState("");

  const dayName = getDayName();

  useEffect(() => {
    // Load data from localStorage on component mount
    const storedData = JSON.parse(localStorage.getItem("dailyplanner")) || {};
    const savedDate = localStorage.getItem("lastSavedDate");
    setLastSavedDate(savedDate);

    if (savedDate !== getCurrentDate()) {
      // If the last saved date is not today, set default state values
      setBrainDump("");
      setMorningGratitude("•\n•\n•\n•");
      setNightGratitude("•\n•\n•\n•");
    } else {
      // Otherwise, load the saved data
      setBrainDump(storedData.brainDump || "");
      setMorningGratitude(storedData.morningGratitude || "");
      setNightGratitude(storedData.nightGratitude || "");
    }
  }, []);

  const handleBrainDumpChange = (e) => {
    const value = e.target.value;
    setBrainDump(value);
    saveToLocalStorage({ brainDump: value });
  };

  const handleMorningGratitudeChange = (e) => {
    const value = e.target.value;
    setMorningGratitude(value);
    saveToLocalStorage({ morningGratitude: value });
  };

  const handleNightGratitudeChange = (e) => {
    const value = e.target.value;
    setNightGratitude(value);
    saveToLocalStorage({ nightGratitude: value });
  };

  const saveToLocalStorage = (data) => {
    const currentDate = getCurrentDate();
    localStorage.setItem("lastSavedDate", currentDate);

    const currentData = JSON.parse(localStorage.getItem("dailyplanner")) || {};
    const newData = { ...currentData, ...data };
    localStorage.setItem("dailyplanner", JSON.stringify(newData));
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString();
  };

  return (
    <div
      className="daily-planner planner"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      <div className="header">
        <h2>{dayName}</h2>
        <p>Daily Planner</p>
      </div>
      <div className="main">
        <div className="one">
          <Todo />
          <h4>Brain Dump</h4>
          <textarea
            name="BrainDump"
            value={brainDump}
            onChange={handleBrainDumpChange}
            cols="30"
            rows="10"
            placeholder="Write down anything in your head..."
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          ></textarea>
        </div>
        <div className="two">
          <h4>Morning Gratitude</h4>
          <textarea
            name="Morning"
            value={morningGratitude}
            onChange={handleMorningGratitudeChange}
            cols="30"
            rows="6"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          ></textarea>
          <h4>Night Gratitude</h4>
          <textarea
            name="Night"
            value={nightGratitude}
            onChange={handleNightGratitudeChange}
            cols="30"
            rows="6"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          ></textarea>
        </div>
      </div>
      <div
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
        className="bottom-nav"
      >
        <div></div>
        <div>
          <Link
            to="/mo"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            Monthly
          </Link>{" "}
          <span>|</span>
          <Link
            to="/"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            Weekly
          </Link>
          <span>|</span>
          <ThemeMode />
        </div>
      </div>
    </div>
  );
}
