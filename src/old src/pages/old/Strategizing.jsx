import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import "./Strategizing.css";
import { redirect, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateGoal } from "../features/GoalSlice";
import html2pdf from "html2pdf.js";
export default function Strategizing() {
  const [goal, setGoal] = useState();
  const user = useSelector((state) => state.user);
  const sendGoals = async (g) => {
    if (goals.id == null) {
      const response = await fetch(
        "https://main-server1-kiztopia2020-gmailcom.vercel.app/goal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.value.name,
            future: goals.future,
            goals: g,
            userId: user.value._id,
          }),
        }
      );

      if (response.ok) {
      } else {
      }
    } else {
      const response = await fetch(
        "https://main-server1-kiztopia2020-gmailcom.vercel.app/updateGoal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            future: goals.future.join("~ "),
            id: goals.id,
            goals: g,
            userId: user.value._id,
          }),
        }
      );

      if (response.ok) {
      } else {
        console.log(response);
      }
    }
  };

  const goals = useSelector((state) => state.goals);
  const dispatch = useDispatch();

  useEffect(() => {
    setGoal(goals.goals[0]);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // You can use 'auto' or 'instant' for different scroll behavior
    });
  }, []);

  let summaryHandler = () => {
    let evaluation = document.getElementById("evaluation");
    let impact = document.getElementById("impact");
    let strategy = document.getElementById("strategy");
    let obstacle = document.getElementById("obstacle");
    let benchmarks = document.getElementById("benchmarks");
    let updatedGoal = {
      evaluation: evaluation.value,
      impact: impact.value,
      strategy: strategy.value,
      obstacle: obstacle.value,
      goal: goal.goal,
      description: goal.description,
      benchmarks: benchmarks.value,
    };
    let index = goals.goals.findIndex((g) => g.goal == goal.goal);
    const jsonString = JSON.stringify(updatedGoal);
    dispatch(updateGoal({ index, updated: updatedGoal }));
    sendGoals(jsonString);
    evaluation.value = "";
    impact.value = "";
    obstacle.value = "";
    strategy.value = "";
    benchmarks.value = "";

    if (goals.goals.length == index + 1) {
      let summary = document.getElementById("summary-link");
      summary.click();
    } else {
      setGoal(goals.goals[index + 1]);
      console.log(goal);
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", // You can use 'auto' or 'instant' for different scroll behavior
      });
    }
  };
  let finishHandler = () => {
    let evaluation = document.getElementById("evaluation");
    let impact = document.getElementById("impact");
    let strategy = document.getElementById("strategy");
    let obstacle = document.getElementById("obstacle");
    let benchmarks = document.getElementById("benchmarks");
    let updatedGoal = {
      evaluation: evaluation.value,
      impact: impact.value,
      strategy: strategy.value,
      obstacle: obstacle.value,
      goal: goal.goal,
      description: goal.description,
      benchmarks: benchmarks.value,
    };
    let index = goals.goals.findIndex((g) => g.goal == goal.goal);
    const jsonString = JSON.stringify(updatedGoal);
    dispatch(updateGoal({ index, updated: updatedGoal }));
    sendGoals(jsonString);
    evaluation.value = "";
    impact.value = "";
    obstacle.value = "";
    strategy.value = "";
    benchmarks.value = "";

    let summary = document.getElementById("summary-link");
    summary.click();
  };
  return (
    <div className="strategy-page">
      <Nav />
      <h2>Strategizing About Your Goals.</h2>
      <p className="text">
        Now you will be asked about the following elements or features for each
        of the specific goals you have identified:
      </p>
      <ul>
        <li>Evaluating the reason you’re doing it (motive)</li>
        <li>Considering the Broad Personal and Social Impact of Goals</li>
        <li>Considering the Detailed Strategies for Goal Attainment</li>
        <li>Identifying Potential Obstacles and Their Solutions</li>
        <li>Monitoring Progress towards Desired Goals</li>
      </ul>
      <p className="text">
        Thus, the five pages that contain these elements or features will repeat
        until all your goals have been assessed.
      </p>
      <hr />
      <div className="goal-container">
        <h3>Your Goal : {goal ? goal.goal : ""} </h3>
        <p className="text">{goal ? goal.description : ""}</p>
      </div>
      <h3>Evaluating Your Motives</h3>
      <p className="text">
        For this goal, you might want to consider issues such as the following:
      </p>
      <ul>
        <li>Do you truly believe that pursuing this goal is important?</li>
        <li>Would you feel ashamed, guilty, or anxious if you didn't?</li>
        <li>
          Do you want to achieve this goal personally, or are you doing it to
          please someone else? (It is often a good thing to do something for
          someone else, but you should know when you are doing that.)
        </li>
        <li>
          Are you pursuing this goal because the situation that you find
          yourself in seems to demand it?
        </li>
        <li>
          Is the pursuit of this goal enjoyable, stimulating, or satisfying?
        </li>
      </ul>
      <p className="text">
        Is this goal part of a deeply felt personal dream? Please spend a minute
        or two writing down your reasons for pursuing this goal:
      </p>
      <textarea
        name="evaluation"
        id="evaluation"
        cols="30"
        rows="10"
      ></textarea>
      <hr />
      <h3>Considering the Broad Personal and Social Impact of Goals</h3>
      <p className="text">
        Goals can have an impact beyond the obvious. Our specific personal goals
        are connected to larger, more important life goals. These higher-order
        goals reflect our most important ideals.
      </p>
      <p className="text">
        For example. The specific goal of spending more time studying or reading
        is a specific element of the more important goal of being a
        well-educated person. Achieving other specific goals, such as becoming
        more assertive, helps us to move closer to our ideal self.{" "}
      </p>
      <p className="text">
        You will now be asked to write about what more globally important things
        might be affected by your attainment of the goal listed below:
      </p>
      <ul>
        <li>
          How would disciplined success change the way that you see yourself?
        </li>
        <li>
          How would other parts of your personal life change, in consequence?
        </li>
        <li>
          How would this affect the way that others perceive you? (You might
          also consider fears of being successful. Sometimes people are afraid
          to succeed because of the responsibility this would entail. Sometimes
          they are afraid of even becoming conscious of their true goals because
          then they would be aware when they fail. These are not good
          strategies.)
        </li>
        <li>
          How would attaining this goal affect the lives of the people around
          you?
        </li>
        <li>
          What broader beneficial social impact might your success have? Please
        </li>
      </ul>
      <p className="text">
        write a short description of how attaining this goal would change
        additional important aspects of your life and the lives of others.
      </p>
      <textarea name="impact" id="impact" cols="30" rows="10"></textarea>
      <hr />
      <h3>Considering the Detailed Strategies for Goal Attainment</h3>
      <p className="text">
        <bold>
          {" "}
          Goals are related to lesser, smaller sub-goals and behaviors, as well
          as connected to higher-order, more important abstract goals.
        </bold>{" "}
        <br /> Sub-goals are easier to achieve but are still fundamental to
        reaching our greater aspirations. Sub-goals can thus be thought of as
        strategies for greater goal achievement. <br />
        <br /> Thinking about what specific things need to be done to achieve
        your goals allows you to create practical strategies for realizing your
        dreams. Please take some time to write about the concrete daily or
        weekly things you might do to further your goal. Deeply consider what
        particular behaviors this goal is built upon.
      </p>
      <ul>
        <li>Should you spend more time planning at school or work?</li>
        <li>
          Do you need to spend more time with your friends, or your children?{" "}
        </li>
        <li>
          Do you need to discuss household chores with your roommates, partner,
          or spouse?
        </li>
      </ul>
      <p className="text">
        Specify when you are going to work on your goal. Specify how often.
        Specify where. Think hard about how you are going to implement your
        plans. Make your plans concrete. Write down those concrete weekly or
        daily things you might do to further this goal.
      </p>
      <textarea name="strategy" id="strategy" cols="30" rows="10"></textarea>
      <hr />
      <h3>Identifying Potential Obstacles and Their Solutions</h3>
      <p className="text">
        Thinking about achieving a goal is easier than going out and getting it
        done. Many things related to the natural environment, the social group,
        and the self can stand in your way. It is useful to anticipate these
        difficulties so that you can plan to overcome them. Consider your goal,
        once again. Write down all the potential obstacles you can think of.
        Write down ways to overcome these obstacles.
      </p>
      <ul>
        <li>How might you interfere with your plans? </li>
        <li>
          How can you ensure this won't happen? (Sometimes change is threatening
          to people we know and love)
        </li>
        <li>Will the people you know help you, or interfere?</li>
        <li>
          How can you communicate with them, so that they will support you?{" "}
        </li>
        <li>Think of realistic and worst-case scenarios.</li>
        <li>What are your options?</li>
        <li> What are your alternative plans?</li>
      </ul>
      <p className="text">
        Write down potential obstacles to this goal, and specify the ways you
        might overcome them.
      </p>
      <textarea name="obstacle" id="obstacle" cols="30" rows="10"></textarea>
      <hr />
      <h3>Monitoring Progress towards Desired Goals</h3>
      <p className="text">
        We need to know, concretely, whether or not we are progressing toward
        the attainment of valued goals. Of course, this is not an easy task.
        When we want to complete very specific tasks, feedback on our
        performance is relatively easy to monitor. However, if our goals are
        less short-term, this becomes a little more difficult.
      </p>
      <p className="text">
        You are now being asked to identify personal benchmarks that will allow
        you to evaluate your own performance.
      </p>

      <ul>
        <li>
          When would you like to achieve this goal? (Be specific. Even if you
          have to revise a deadline later, it is still better to set one)
        </li>
        <li>
          What sorts of things will you accept as evidence that you are
          progressing towards your stated goal?
        </li>
        <li>How often are you going to monitor your own behavior?</li>
        <li>
          How will things in your life have to change, measurably, for you to
          feel satisfied with your progress?
        </li>
        <li>
          How can you ensure that you are neither pushing yourself too hard, and
          ensuring failure, nor being too easy on yourself, and risking boredom
          and cynicism?
        </li>
      </ul>
      <p className="text">
        Your benchmarks should be personal indicators of success. It doesn't
        matter what others may think defines progress towards your goal. Write
        down those accomplishments that would truly indicate positive movement
        on your part. Feel free to write as much as you feel is necessary. Write
        down how you might monitor your progress with regard to this goal.
      </p>
      <textarea
        name="benchmarks"
        id="benchmarks"
        cols="30"
        rows="10"
      ></textarea>
      <div className="bottom-buttons">
        <button onClick={finishHandler}>Finish</button>
        <button className="button" onClick={summaryHandler}>
          summary
        </button>
        <Link
          to={"/summary"}
          className="summary-link hidden"
          id="summary-link"
        ></Link>
      </div>
    </div>
  );
}
