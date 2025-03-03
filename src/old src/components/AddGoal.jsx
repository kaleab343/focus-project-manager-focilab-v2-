import React, { useEffect } from "react";
import "./AddGoal.css";
import { useDispatch, useSelector } from "react-redux";
import { addGoal } from "../features/GoalSlice";
import { Link } from "react-router-dom";
export default function AddGoal() {
  const goals = useSelector((state) => state.goals).goals;
  const dispatch = useDispatch();
  const addGoalHandler = () => {
    let goal = document.getElementById("goal-name");
    let description = document.getElementById("goal-description");
    dispatch(addGoal({ goal: goal.value, description: description.value }));
    goal.value = "";
    description.value = "";
  };
  const finishHandler = () => {
    let goal = document.getElementById("goal-name");
    let description = document.getElementById("goal-description");
    dispatch(addGoal({ goal: goal.value, description: description.value }));
    goal.value = "";
    description.value = "";

    let a = document.getElementById("finish-goals-button");
    a.click();
  };
  useEffect(() => {}, []);
  return (
    <div className="add-goal">
      <div className="goals">
        <h4>Your Goals: </h4>
        {goals.map((e, i) => (
          <span className="goal" key={i}>
            {e.goal}
          </span>
        ))}
      </div>
      <br />

      <div className="new-goal">
        <h4>Add a New Goal</h4>
        <div className="goal-name cont">
          <label htmlFor="goal-name">Goal</label>
          <input type="text" name="goal-name" id="goal-name" />
        </div>
        <div className="goal-description con">
          <label htmlFor="goal-description">Description</label>
          <textarea
            name="goal-description"
            id="goal-description"
            cols="10"
            rows="10"
          ></textarea>
        </div>
        <div className="buttons">
          <button onClick={addGoalHandler}> Add Goal</button>
          <button onClick={finishHandler} className="button">
            Finish
          </button>
          <Link
            to="/goal-strategy"
            className="button hidden"
            id="finish-goals-button"
          >
            Finish
          </Link>
        </div>
      </div>
    </div>
  );
}
