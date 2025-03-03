import React, { useEffect, useState } from "react";
import "./PastsWeeklyGoals.css";
import axios from "axios";
import "./WeeklyGoals.css";
import { FaCheckCircle } from "react-icons/fa";
import { getMonday, getPreviousMonday } from "./Utils";

const WEEKLY_GOALS_STORAGE_KEY = "past_weekly_goals";

function PastWeeklyGoals() {
  const [weeklyGoals, setWeeklyGoals] = useState([]);

  useEffect(() => {
    const fetchPastWeeklyGoals = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("User ID not found in localStorage");
          return;
        }

        const weekStartDate = getPreviousMonday();

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

        localStorage.setItem(
          WEEKLY_GOALS_STORAGE_KEY,
          JSON.stringify(response.data.goals || [])
        );
      } catch (error) {
        console.error("Error fetching past weekly goals:", error);
      }
    };

    fetchPastWeeklyGoals();
  }, []);

  // Calculate the percentage of completed tasks
  const completedTasksCount = weeklyGoals.filter(
    (goal) => goal.completed
  ).length;
  const totalTasksCount = weeklyGoals.length;
  const percentCompleted =
    totalTasksCount === 0 ? 0 : (completedTasksCount / totalTasksCount) * 100;

  return (
    <div className="weekly-goals-list">
      {weeklyGoals.length === 0 ? (
        <p>No previous data</p>
      ) : (
        <>
          <ul className="goals">
            {weeklyGoals.map((goal, index) => (
              <li className="goal" key={goal._id}>
                <span>{goal.description}</span>
                {goal.completed && <FaCheckCircle className="check" />}
              </li>
            ))}
          </ul>

          <div className="analytics">
            <p>{`${percentCompleted}% done`}</p>
            <progress value={percentCompleted} max="100" />
          </div>
        </>
      )}
    </div>
  );
}

export default PastWeeklyGoals;
