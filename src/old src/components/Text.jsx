import React, { useEffect, useState } from "react";
import "./Text.css";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { addFuture, setId, updateFuture } from "../features/GoalSlice";
import { getGoals } from "../pages/utils";
import { incrementQ, setQuestionNo } from "../features/QuestionSlice";
import FutureNavigator from "./FutureNavigator";
import html2canvas from "html2canvas";
import Ad from "./Ad";
export default function Text() {
  let user = useSelector((state) => state.user);
  let goals = useSelector((state) => state.goals);
  let questionNo = useSelector((state) => state.questionNo);
  const dispatch = useDispatch();
  // const [question, setQuestion] = useState(1);

  const sendFuture = async () => {
    if (goals.id == null) {
      console.log(goals.future);
      let future = goals.future;

      let f = future.join("~ ");
      // f += `~${answer}`;

      // console.log(f, answer);

      const response = await fetch(
        "https://main-server1-kiztopia2020-gmailcom.vercel.app/goal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.value.name,
            future: f,
            userId: user.value._id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        dispatch(setId(data._id));
      } else {
        console.log(response);
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
            goals: goals.goals.join("~ "),
            userId: user.value._id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
      } else {
        console.log(response);
      }
    }
  };

  const showQuestion = (num) => {
    let all = document.querySelectorAll(".question");
    all.forEach((d, i) => {
      d.style.display = "none";
    });
    all[num - 1].style.display = "block";
  };

  const downloadJpeg = () => {
    const element = document.body;

    // Use html2canvas to capture the entire HTML content
    html2canvas(element, { scale: 2 })
      .then((canvas) => {
        // Convert the canvas to a data URL representing a JPEG image
        const dataUrl = canvas.toDataURL("image/jpeg");

        // Create a link element to trigger the download
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "document.jpg";

        // Append the link to the document and simulate a click to trigger the download
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Error during HTML to JPEG conversion:", error);
      });
  };
  // checks if we are on question number 10
  const FutureFormSummary = (last) => {
    let all = document.querySelectorAll(".question");
    let text = document.getElementById("answerArea");
    text.classList.add("hidden");
    all.forEach((d, i) => {
      if (i == 9) {
        var answer = document.createTextNode(last);
      } else {
        var answer = document.createTextNode(goals.future[i]);
      }
      let newP = document.createElement("div");
      newP.classList.add("answer-p");
      newP.appendChild(answer);
      d.appendChild(newP);
      d.style.display = "block";
    });

    let nextBtn = document.getElementById("text-next");
    let goalsBtn = document.getElementById("text-goals");
    nextBtn.classList.add("hidden");
    goalsBtn.classList.remove("hidden");
    downloadJpeg();
  };

  useEffect(() => {
    // navigator color
    // let button = document.querySelectorAll(".q1")[questionNo.value - 1];
    // let oldActive = document.querySelector(".active-q");
    // oldActive.classList.remove("active-q");
    // button.classList.add("active-q");

    if (questionNo.value >= 1) {
      let letter = numberToLetter(questionNo.value + 1);
      let previous = numberToLetter(questionNo.value);

      // let active = document.getElementsByClassName(letter)[0];
      // active.style.display = "block";

      // let pre = document.getElementsByClassName(previous)[0];
      // pre.style.display = "none";
      showQuestion(questionNo.value);
      sendFuture();

      // submit and save data handler
    }
    let ans = document.getElementById("answerArea");

    // text value
    console.log("test", questionNo, goals.future);
    if (goals.future[questionNo.value - 1] != undefined) {
      ans.value = goals.future[questionNo.value - 1];
    } else {
      ans.value = "";
    }
  }, [questionNo.value]);

  let nextHandler = (num) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // You can use 'auto' or 'instant' for different scroll behavior
    });

    let ans = document.getElementById("answerArea");
    let temp = ans.value;

    dispatch(addFuture({ index: questionNo.value, data: temp }));
    if (num == 11) {
      FutureFormSummary(temp);
      return 0;
    }
    dispatch(setQuestionNo(num));

    // if (question == 10) {
    //   let all = document.querySelectorAll(".question");
    //   all.forEach((d, i) => {
    //     var answer = document.createTextNode(answers[i].answer);
    //     let newP = document.createElement("div");
    //     newP.classList.add("answer-p");
    //     newP.appendChild(answer);
    //     d.appendChild(newP);
    //     d.style.display = "block";
    //   });
    //   const jsonString = JSON.stringify(answers);
    //   setFuture(user.email, jsonString, "null");

    //   let nextBtn = document.getElementById("text-next");
    //   let goalsBtn = document.getElementById("text-goals");
    //   nextBtn.classList.add("hidden");
    //   goalsBtn.classList.remove("hidden");
    //   console.log(nextBtn);
    // } else {
    //   let letter = numberToLetter(question + 1);
    //   let previous = numberToLetter(question);

    //   let active = document.getElementsByClassName(letter)[0];
    //   active.style.display = "block";

    //   let pre = document.getElementsByClassName(previous)[0];
    //   pre.style.display = "none";
    //   setQuestion(question + 1);
    // }
    // setFuture(temp);
  };

  function numberToLetter(number) {
    const letterMap = {
      0: "zero",
      1: "one",
      2: "two",
      3: "three",
      4: "four",
      5: "five",
      6: "six",
      7: "seven",
      8: "eight",
      9: "nine",
      10: "ten",
      // Add more mappings as needed
    };

    // Check if the input number exists in the mapping
    if (letterMap.hasOwnProperty(number)) {
      return letterMap[number];
    } else {
      // Handle the case where the input is not a valid number
      return null; // or any other value to indicate an error
    }
  }

  useEffect(() => {
    // let ans = document.getElementById("answerArea");
    // if (goals.future[questionNo.value - 1] != undefined) {
    //   ans.value = goals.future[questionNo.value - 1];
    // }
    // let letter = numberToLetter(questionNo.value);
    // let previous = numberToLetter(questionNo.value);
    // let active = document.getElementsByClassName(letter)[0];
    // active.style.display = "block";
    // let pre = document.getElementsByClassName(previous)[0];
    // pre.style.display = "none";
    // questionNavigatorHandler(questionNo.value);
  }, []);

  const questionNavigatorHandler = (num) => {
    let button = document.querySelectorAll(".q1")[num];
    let oldActive = document.querySelector(".active-q");
    oldActive.classList.remove("active-q");
    button.classList.add("active-q");
    dispatch(setQuestionNo(num + 1));
  };
  return (
    <div className="text-container">
      <div className="questions">
        <div className="question one">
          <h3>The Ideal Future: Introductory Notes and Thoughts</h3>
          <p className="detail">
            In this exercise you will begin to create a version, in writing, of
            your ideal future.
            {/* William James, the great American psychologist,
            once remarked that he did not know what he thought until he had
            written his thoughts down. When he didn't know what to write, he
            wrote about anything that came to mind. Eventually, his ideas became
            focused and clarified. */}
          </p>
          <p className="detail">
            Brainstorm. Write whatever comes to mind. Don't worry too much about
            sentence construction, spelling, or grammar. There will be plenty of
            time to write polished sentences later. Avoid criticizing what you
            write.
            {/* write. Premature criticism interferes with the creative process. */}
          </p>
          <hr />
          <h3>Imagining Your Ideal Future</h3>
          <p className="detail">
            You will start with some exercises of imagination that will help you
            warm up to the task of defining your future.
          </p>

          <p className="detail">These will include 8 questions such as…</p>
          <ul>
            <li>"what could you do better?" </li>
            <li>"what would you like to learn about?"</li>
            <li>"what habits would you like to improve?"</li>
          </ul>
          <p className="detail">
            After briefly answering these 8 questions, you will be asked to
            write for 15 minutes about your ideal future, without editing or
            criticism.
          </p>
          <p className="detail">
            {" "}
            Let yourself <bold>daydream or fantasize.</bold>You are trying to
            put yourself into a state of imagination, which is a form of
            dream-like thinking that relies heavily on internal imagery. This
            kind of thinking allows all your different internal states of
            motivation and emotion to find their voice.
          </p>
          <p className="detail">
            It might be best to concentrate on your future three to five years
            down the road, although you may have reasons to concentrate on a
            shorter or longer timespan (eighteen months to ten years).
          </p>
          <bold>Good Luck!</bold>
          <hr />
          <h3 className="heading">1. One Thing You Could Do Better</h3>
          <p className="detail">
            If you could choose only one thing that you could do better, what
            would it be?
          </p>
        </div>
        <div className="question two">
          <h3 className="heading">
            2. What would you like to learn more about?
          </h3>
          <p className="detail">
            What would you like to learn more about, in the next:
          </p>
          <ul>
            <li>6 months?</li>
            <li>2 years?</li>
            <li>5 years?</li>
          </ul>
        </div>
        <div className="question three">
          <h3 className="heading">3. What habits would you like to improve?</h3>
          <p className="detail">
            List all the Habits you thing the you need to improve or create or
            many stop
          </p>
          <ul>
            <li>At School</li>
            <li>At Work</li>
            <li>With Family and Friends</li>
            <li>For Your Health</li>
          </ul>
        </div>
        <div className="question four">
          <h3 className="heading">4. Your Social Life in the Future</h3>
          <p className="detail">
            <bold>
              Friends and associates are an important part of a meaningful,
              productive life.
            </bold>
            <br /> Take a moment to consider your social network. Think about
            the friends you might want to have and the connections you might
            want to make. <br /> It is perfectly reasonable to choose friends
            and associates who are good for you. Describe your ideal social
            life.
          </p>
        </div>

        <div className="question five">
          <h3 className="heading">5. Your Fun Time Activity in the Future.</h3>
          <p className="detail">
            Take a moment to consider the activities you would like to pursue
            outside of obligations such as work, family, and school. The
            activities you choose should be worthwhile and personally
            meaningful. <br />
            <br /> Without a plan, people often default to whatever is easiest,
            such as television watching, and waste their private time. If you
            waste 4 hours a day, which is not uncommon, then you are wasting
            1,400 hours a year. That is equivalent to 35-40 hour work weeks,
            which is almost as much as the typical individual spends at his or
            her job every year. <br />
            <br /> If your time is worth $25 per hour, then you are wasting time
            worth $35,000 per year. Over 50 years, that is 1.8 million dollars,
            not counting interest or any increase in the value of your time as
            you develop. <br />
            <br /> Describe what your free time life would be like if it was set
            up to be genuinely productive and enjoyable.
          </p>
        </div>

        <div className="question six">
          <h3 className="heading">6. Your Family Life in the Future</h3>
          <p className="detail">
            Take a moment to consider your home and family life. A peaceful,
            harmonious family life provides people with a sense of belonging,
            support for their ambitions, and reciprocal purpose. Describe what
            your ideal family would be like. You can write about:
          </p>
          <ul>
            <li>your parents and siblings</li>
            <li>
              How could you improve your relationship with your parents or
              siblings?
            </li>
            <li>about your plans for your partner</li>
            <li>What kind of partner would be good for you?</li>
            <li>about your children, if any - or about all of these.</li>
          </ul>
        </div>

        <div className="question seven">
          <h3 className="heading">7. Your Career in the Future</h3>
          <p className="detail">
            <bold>
              Much of what people find engaging in life is related to their
              careers.
            </bold>{" "}
            A good career provides security, status, interest, and the
            possibility of contributing to the community. Take a moment to
            consider your school or work careers or both. <br />
            <br /> Where do you want to be in Six months, Two years, Five years?
            Why? <br />
            <br /> What are you trying to accomplish?
          </p>
        </div>

        <div className="question eight">
          <h3 className="heading">8. Qualities You Admire</h3>
          <p className="detail">
            People you automatically admire have qualities that you would like
            to possess or imitate. Identifying those qualities can help you
            determine who it is that you want to be. Take a moment to think
            about the two or three people you most admire. <br />
            <br /> Who are they? <br />
            <br />
            Which qualities do they possess that you wish you had?
          </p>
        </div>

        <div className="question nine">
          <h3 className="heading">9. The Ideal Future</h3>
          <p className="detail">
            Now you have written briefly about your future, and have had some
            time to consider more specific issues. This step gives you the
            chance to integrate all the things that you have just thought and
            written about. <br />
            <br /> Close your eyes. Daydream, if you can, and imagine your ideal
            future:
          </p>
          <ul>
            <li>Who do you want to be?</li>
            <li>What do you want to do?</li>
            <li>Where do you want to end up</li>
            <li>Why do you want these things?</li>
            <li>How do you plan to achieve your goals?</li>
            <li>When will you put your plans into action?</li>
            <li>Why do you want these things?</li>
          </ul>
          <p className="detail">
            Write about the ideal future that you have just imagined for 15
            minutes. Write continuously and try not to stop while you are
            writing. Don't worry about spelling or grammar. You will have an
            opportunity to fix your mistakes later. <br />
            <br /> Dream while you write, and don't stop. Write at least until
            the 5 minutes have passed. Be ambitious. Imagine a life that you
            would regard as honorable, exciting, productive, creative, and
            decent. <br />
            <br />
            <bold> Remember, you are writing only for yourself</bold>. Choose
            goals that you want to pursue for your private reasons, not because
            someone else thinks that those goals are important. You don't want
            to live someone else's life. Include your deepest thoughts and
            feelings about all your personal goals.
          </p>
        </div>

        <div className="question ten">
          <h3 className="heading">10. A Future to Avoid</h3>
          <p className="detail">
            You have now written about the future you would like to have. <br />
            Clearly defining your future can help reduce the uncertainty in your
            life, and reduce the amount of negative emotion that you chronically
            experience, as a consequence.
            <br /> This is good for your confidence and for your health. Having
            well-defined goals also increases your chances of experiencing
            positive emotion, as people experience most of their hope, joy,
            curiosity, and engagement as a consequence of{" "}
            <bold>
              pursuing valued goals (and not, as people generally think, by
              attaining them).
            </bold>
            <br />
            <br />
            It can also be very useful to deeply imagine the future you would
            like to avoid. You probably know people who have made very bad
            decisions, and who end up with a life that nobody would want. You
            also likely have weaknesses yourself. If you let those get out of
            control, then you might also end up with a miserable, painful life.{" "}
            <br />
            <br />
            Spend some time, now, thinking about what your life would be like if
            you failed to define or pursue your goals, if you let your bad
            habits get out of control, and if you ended up miserable, resentful
            and bitter. <br />
            <br />
            Imagine your life three to five years down the road, if you failed
            to stay on the path you know you should be on. Use your imagination.
            Draw on your knowledge of the anxiety and pain you have experienced
            in the past when you have betrayed yourself. Think about the people
            you know who have made bad decisions or remained indecisive, or who
            chronically deceive themselves or other people, or who let cynicism
            and anger dominate their lives. <br />
            <br />
            Where do you not want to be? Dream while you write, and don't stop.
            Write at least until the 5 minutes have passed. Let yourself form a
            very clear picture of the undesirable future.
          </p>
        </div>
        <textarea
          id="answerArea"
          name="myTextarea"
          rows="6"
          cols="78"
        ></textarea>
        <button
          onClick={() => nextHandler(questionNo.value + 1)}
          id="text-next"
        >
          Next
        </button>

        <div className="hidden" id="text-goals">
          <button className="" onClick={() => nextHandler(1)}>
            Edit
          </button>
          <p>
            <bold className="green"> Congratulations!</bold> You have finished
            the first section of this program. Now, you need a specific goal and
            plan to make your future a reality and avoid the future you don't
            want. If you want to continue, press the button below to start
            making new goals. However, you can exit and come back later to
            create your goals.
          </p>
          <Link to="/goals" className="button long-button">
            Go to Goals Planner
          </Link>
        </div>
      </div>
      <FutureNavigator nextHandler={nextHandler} questionNo={questionNo} />
      <Ad></Ad>
    </div>
  );
}
