import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiSquarePlus } from "react-icons/ci";
import axios from "axios";
import "./WeeklyPlanner.css";
import PastWeeklyGoals from "../components/PastWeeklyGoals";
import { getMonday } from "../components/Utils";
import WeekName from "../components/weekly/WeekName";
import Register from "../components/Register";
import "./weeklyPlannerDriven.css";
import ThemeMode from "../components/weekly/ThemeMode";
import Popup from "../components/Popup";
import { Link } from "react-router-dom";

const WEEKLY_GOALS_STORAGE_KEY = "weekly_goals";

function WeeklyPlanner() {
  /// weekly forms
  const [formData, setFormData] = useState({
    previousWeek: "",
    thisWeek: "",
    habits: "1. \n2. \n3. ",
    habitObstacle: "",
    projects: "", // New field for projects
  });

  const [newHabit, setNewHabit] = useState();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const formDataString = JSON.stringify(formData);
    console.log(weeklyGoals);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }
      const weekStartDate = getMonday();

      const response = await axios.post(
        `https://foci-server.vercel.app/weekly-goal`,
        {
          user_id: userId,
          week_start_date: weekStartDate,
          goals: weeklyGoals,
          details: formDataString,
        }
      );
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  //component
  const [weeklyGoals, setWeeklyGoals] = useState([]);

  const [newGoal, setNewGoal] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchWeeklyGoals = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }

        const weekStartDate = getMonday();

        const response = await axios.get(
          "https://foci-server.vercel.app/get-weekly-goals",
          {
            params: {
              user_id: userId,
              week_start_date: weekStartDate,
            },
          }
        );
        setWeeklyGoals(response.data.goals || []);
        const formDataObject = JSON.parse(
          response.data.details || {
            previousWeek: "",
            thisWeek: "",
            habits: "1. \n2. \n3. ",
            habitObstacle: "",
          }
        );

        setFormData(formDataObject);
        localStorage.setItem(
          WEEKLY_GOALS_STORAGE_KEY,
          JSON.stringify(response.data.goals || [])
        );
      } catch (error) {
        console.error("Error fetching weekly goals:", error);
      }
    };

    fetchWeeklyGoals();
  }, []);

  useEffect(() => {
    async function update() {
      const formDataString = JSON.stringify(formData);
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const weekStartDate = getMonday();
      try {
        // Add goal to local storage

        // Add goal to server
        const response = await axios.post(
          "https://foci-server.vercel.app/weekly-goal",
          {
            user_id: userId,
            week_start_date: weekStartDate,
            goals: weeklyGoals,
            details: formDataString,
          }
        );
        console.log("New weekly goal added successfully:", response.data);
      } catch (error) {
        console.error("Error adding weekly goal:", error);
      }
    }
    update();
  }, [weeklyGoals]);
  const addGoal = async (text) => {
    const newGoal = {
      description: text,
      completed: false,
    };
    let storedGoals = JSON.parse(
      localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY)
    );
    if (!Array.isArray(storedGoals)) {
      storedGoals = [];
    }
    const updatedGoals = [...storedGoals, newGoal];
    localStorage.setItem(
      WEEKLY_GOALS_STORAGE_KEY,
      JSON.stringify(updatedGoals)
    );

    setNewGoal("");
    setWeeklyGoals((prevGoals) => [...prevGoals, newGoal]);
  };

  const removeGoal = async (description) => {
    const formDataString = JSON.stringify(formData);
    try {
      // Obtain user_id and week_start_date from local storage or component state
      const userId = localStorage.getItem("user_id");

      const weekStartDate = getMonday();

      // Update local storage immediately
      let storedGoals =
        JSON.parse(localStorage.getItem(WEEKLY_GOALS_STORAGE_KEY)) || [];

      console.log(storedGoals);
      const updatedGoals = storedGoals.filter(
        (goal) => goal.description !== description
      );
      console.log(updatedGoals);
      localStorage.setItem(
        WEEKLY_GOALS_STORAGE_KEY,
        JSON.stringify(updatedGoals)
      );
      setWeeklyGoals(updatedGoals);

      // Send update request to server
      await axios.post(`https://foci-server.vercel.app/weekly-goal`, {
        user_id: userId,
        week_start_date: weekStartDate,
        goals: updatedGoals,
        details: formDataString,
      });

      // Alternatively, if the server responds with success, you can omit the setWeeklyGoals and localStorage.setItem calls
      // If there's an error, you may need to roll back the changes made locally
    } catch (error) {
      console.error("Error removing weekly goal:", error);
      // Handle error if needed
    }
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
  }, [formData]);
  return (
    <div
      className="weekly-planner planner"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      <Popup />
      <WeekName />
      <h2 className="header">Weekly Planner</h2>
      <Register />

      <div
        className="main"
        style={{
          backgroundColor: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      >
        <div className="goals-cont ch">
          <h4>Goals</h4>
          <ul className="goals">
            {weeklyGoals.map((goal, index) => (
              <li
                className="goal"
                key={goal._id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span>{goal.description}</span>
                {hoveredIndex === index && (
                  <span
                    className="remove-goal"
                    onClick={() => removeGoal(goal.description)}
                  >
                    <MdDelete />
                  </span>
                )}
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addGoal(newGoal);
            }}
          >
            <label htmlFor="new-goal">
              <CiSquarePlus className="add" />
            </label>
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="input"
              id="new-goal"
              placeholder="Add new goal..."
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />
            <button type="submit" className="add-goal">
              Add Goal
            </button>
          </form>
          <br />

          <div className="this-week">
            <label
              htmlFor="thisWeekInput"
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            >
              How Will I Improve From Last Week?
            </label>
            <textarea
              rows="7"
              placeholder="Write Here..."
              id="thisWeekInput"
              name="thisWeek" // Add name attribute
              value={formData.thisWeek}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />
          </div>
        </div>
        <div className="projects ch">
          <h4>My Projects</h4>
          <textarea
            style={{
              backgroundColor: "var(--bg-color)",
              color: "var(--text-color)",
            }}
            name="projects"
            id="projects" // Add id for easier accessibility
            cols="30"
            rows="10"
            placeholder="What are the things I am working on this week..."
            value={formData.projects} // Use formData.projects as value
            onChange={handleChange} // Handle changes
          />
          <br />
          <div className="obstacles">
            <label
              htmlFor="habitObstacle"
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            >
              WHAT IS STANDING IN MY WAY OF ACHIEVING MY GOALS
            </label>
            <span
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            >
              What Can I Do About It?
            </span>

            <textarea
              id="habitObstacle"
              name="habitObstacle"
              value={formData.habitObstacle}
              onChange={handleChange}
              placeholder="Write Here..."
              rows={4}
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />
          </div>
        </div>
        <div className="aside ch">
          <h4>Last Weeks analytics</h4>
          <PastWeeklyGoals></PastWeeklyGoals>
          <div className="PreviousWeek ">
            <label htmlFor="previousWeekInput">
              <h4>My Previous Week:(reflection)</h4>
            </label>
            <textarea
              rows="5"
              id="previousWeekInput"
              name="previousWeek" // Add name attribute
              value={formData.previousWeek}
              onChange={handleChange}
              placeholder="Write Here..."
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />
          </div>
          <div className="habits">
            <label htmlFor="newHabit">
              <h4>Weekly Focus Habits</h4>
            </label>
            <textarea
              id="newHabit"
              name="habits"
              rows={4}
              value={formData.habits}
              onChange={handleChange}
              style={{
                backgroundColor: "var(--bg-color)",
                color: "var(--text-color)",
              }}
            />
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

export default WeeklyPlanner;
