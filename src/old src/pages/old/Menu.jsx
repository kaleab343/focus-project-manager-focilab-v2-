import React, { useEffect } from "react";
import "./Menu.css";
import Nav from "../../components/Nav";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateFuture } from "../../features/GoalSlice";
import { setQuestionNo } from "../../features/QuestionSlice";
import { useUser } from "@clerk/clerk-react";
import { setUser } from "../../features/User";
export default function Menu() {
  // const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  let getData = async (id) => {
    const response = await fetch(
      "https://main-server1-kiztopia2020-gmailcom.vercel.app/getData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      if (data.lastInsertedBook == undefined) {
        dispatch(setQuestionNo(1));
      } else {
        let future = data.lastInsertedBook.future.split("~");
        dispatch(updateFuture(future));
        dispatch(setQuestionNo(future.length));
      }
    } else {
      console.log(response);
    }
  };
  // useEffect(() => {

  //   getData();
  // }, []);

  const { isSignedIn, user, isLoaded } = useUser();
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    dispatch(setQuestionNo(1));
    let a = { _id: user.id, name: user.firstName };
    dispatch(setUser(a));
    getData(user.id);
    return (
      <>
        {user.value !== null ? (
          <div className="menu">
            <Nav />

            <div className="menu-container">
              <div className="element">
                <div>
                  <div className="header-container">
                    <img src="/circle-dark-green.svg" alt="Questions" />
                    <h3>Future Planner</h3>
                  </div>
                  <p>
                    Answer a series of questions that will help you to create
                    your ideal future and download your future blueprint
                    document.
                  </p>
                  <Link to="/stage-one" className="start">
                    Start
                  </Link>
                </div>
              </div>
              <div className="element">
                <div>
                  <div className="header-container">
                    <img src="/circle-dark-green.svg" alt="Questions" />
                    <h3>Goals & Strategy</h3>
                  </div>
                  <p>
                    List out all of your goals and analyze and strategize them
                    on a deeper level.
                  </p>
                  <Link to="/goals" className="start">
                    Start
                  </Link>
                </div>
              </div>
            </div>
            <div className="info">
              <img src="bulb.png" alt="tip" />
              <p>
                Both of these modules will take you 1hr - 3hr depending on your
                writing. so if you don’t have time to sit down and think deeply,
                you can save your progress and continue form you stopped.
                <br /> Just make sure to click the next button before leaving to
                save your data.
              </p>
            </div>
          </div>
        ) : (
          <p>error</p>
        )}{" "}
      </>
    );
  }
  return <div></div>;
}
