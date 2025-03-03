import React, { useEffect } from "react";
import Nav from "../../components/Nav";
import "./Goals.css";
import AddGoal from "../../components/AddGoal";
export default function Goals() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // You can use 'auto' or 'instant' for different scroll behavior
    });
  }, []);
  return (
    <div className="goals-page">
      <Nav />
      <h2>Specifying and Clarifying Your Goals</h2>
      <p className="text">
        <bold>Please break down your ideal future into 8 goals. </bold> You can
        re-word, re-write, and organize the relevant material from Step 1 for
        your goal summaries if you wish, or you can rely on your memory. The
        exercise allows you to specify a minimum of 6 goals, but people who
        identify 8 have better results with this exercise.
      </p>
      <p className="text">
        These specific goals can be from several different domains.
      </p>

      <ul>
        <li>A personal goal might be "I would like to be healthier." </li>
        <li>
          A career goal might be "I would like to be more interested in my job"
        </li>
        <li> A social goal might be "I would like to meet more people".</li>
      </ul>
      <p className="text">
        The summaries you write about each goal should be reasonably brief and
        memorable. Make sure that each goal summary includes nothing but the
        most important information. You will have 10-15 minutes for this part of
        the exercise. Feel free to revise and edit.
      </p>
      <AddGoal />
    </div>
  );
}
