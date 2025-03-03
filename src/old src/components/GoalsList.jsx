import React from "react";
import { useSelector } from "react-redux";
import "./GoalsList.css";
export default function GoalsList({ flag }) {
  const goals = useSelector((state) => state.goals).goals;
  let response = () => {
    console.log(goals);
    if (flag == 1) {
      return (
        <div>
          {goals.map((goal) => (
            <li className="goal">{goal.goal}</li>
          ))}
        </div>
      );
    } else {
      return (
        <div className="goals-list">
          {goals.map((goal) => (
            <>
              <div className="goal">
                <h3>Goal: {goal.goal}</h3>
                <p className="text">{goal.description}</p>
                <h4>Your Motives</h4>
                <p className="text">{goal.evaluation}</p>
                <h4>The Broad Personal and Social Impact of This Goal</h4>
                <p className="text">{goal.impact}</p>
                <h4>A Detailed Strategies for Achieving This Goal</h4>
                <p className="text">{goal.strategy}</p>
                <h4>Potential Obstacles and Their Solutions</h4>
                <p className="text">{goal.obstacle}</p>
              </div>
              <br />
            </>
          ))}
        </div>
      );
    }
  };
  return response();
}
