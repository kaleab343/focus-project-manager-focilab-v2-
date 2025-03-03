import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Monthly.css";
import "./WeeklyPlanner.css";
import ThemeMode from "../components/weekly/ThemeMode";
import { Link } from "react-router-dom";

export default function Monthly() {
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [dayNames, setDayNames] = useState([]);
  const [monthlyPlan, setMonthlyPlan] = useState({
    plan: "",
    goals: "Goal #1: \nGoal #2: \nGoal #3: ",
  });

  const getUserId = () => {
    return localStorage.getItem("user_id");
  };

  const fetchMonthlyPlan = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const month = new Date().toLocaleString("default", { month: "long" });
      const year = new Date().getFullYear();

      const response = await axios.get(
        `https://foci-server.vercel.app/monthly/${userId}/${month + " " + year}`
      );

      if (response.data) {
        const { plan, goals } = response.data;
        setMonthlyPlan({ plan, goals });
      }
    } catch (error) {
      console.error("Error fetching monthly plan:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const month = new Date().toLocaleString("default", { month: "long" });
      const year = new Date().getFullYear();
      const userId = getUserId();
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const { plan, goals } = monthlyPlan;

      await axios.post("https://foci-server.vercel.app/monthly", {
        userId,
        month: `${month} ${year}`,
        plan,
        goals,
      });

      console.log("Monthly plan and goals submitted successfully!");
    } catch (error) {
      console.error("Error submitting monthly plan and goals:", error);
    }
  };
  const highlightCurrentDay = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const days = document.querySelectorAll(".calendar-day");
    days.forEach((day) => {
      console.log(currentDay, day.textContent);
      if (day.textContent == currentDay) {
        day.classList.add("current-day");
      }
    });
  };
  useEffect(() => {
    generateCalendar();
    displayMonthName();
    generateDayNames();

    fetchMonthlyPlan();
  }, []);

  useEffect(() => {
    highlightCurrentDay();
  }, [daysInMonth]);

  const displayMonthName = () => {
    const monthName = new Date().toLocaleString("default", { month: "long" });
    document.querySelector(".month-name").textContent = monthName;
  };
  useEffect(() => {
    const textAreas = document.querySelectorAll("textarea");
    textAreas.forEach((textArea) => {
      textArea.addEventListener("blur", handleSubmit);
    });

    return () => {
      textAreas.forEach((textArea) => {
        textArea.removeEventListener("blur", handleSubmit);
      });
    };
  }, [monthlyPlan]);
  const generateCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Adjust for Monday as the start of the week

    const days = [];
    for (let i = 1; i <= numDaysInMonth; i++) {
      days.push(i);
    }

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.unshift(null);
    }

    setDaysInMonth(days);
  };

  const generateDayNames = () => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Start with Monday
    setDayNames(dayNames);
  };

  return (
    <div
      className="monthly-page planner"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      <h2 className="month-name"></h2>
      <div className="cont">
        <div className="main">
          <div className="main-input">
            <h4>Monthly Plan</h4>
            <textarea
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
              name="text"
              id="monthly-text"
              cols="30"
              rows="6"
              placeholder="Write what you want to achieve in this month"
              value={monthlyPlan.plan}
              onChange={(e) =>
                setMonthlyPlan({ ...monthlyPlan, plan: e.target.value })
              }
            ></textarea>
          </div>
          <div className="main-input goals">
            <h4>Monthly Goals</h4>
            <textarea
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
              name="monthly-goals"
              id="monthly-goals"
              cols="30"
              rows="4"
              value={monthlyPlan.goals}
              onChange={(e) =>
                setMonthlyPlan({ ...monthlyPlan, goals: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        <div className="calendar">
          <div className="calendar-grid">
            {/* Day names */}
            {dayNames.map((name, index) => (
              <div key={index} className="calendar-day day">
                {name}
              </div>
            ))}
            {/* Calendar days */}
            {daysInMonth.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day ? "" : "empty-day"}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
        className="bottom-nav"
      >
        <button onClick={handleSubmit} className="save">
          save
        </button>
        <div>
          <Link
            to="/"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            Weekly
          </Link>{" "}
          <span>|</span>
          <Link
            to="/da"
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
          >
            Daily
          </Link>
          <span>|</span>
          <ThemeMode />
        </div>
      </div>
    </div>
  );
}
