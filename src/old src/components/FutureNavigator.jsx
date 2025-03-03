import React, { useEffect } from "react";

export default function FutureNavigator({ nextHandler, questionNo }) {
  useEffect(() => {
    let button = document.querySelectorAll(".q1")[questionNo.value - 1];
    let oldActive = document.querySelector(".active-q");
    oldActive.classList.remove("active-q");
    button.classList.add("active-q");
  }, [questionNo]);
  return (
    <div className="question-navigator">
      <button className="q1 active-q " onClick={() => nextHandler(1)}></button>
      <button className="q1 " onClick={() => nextHandler(2)}></button>
      <button className="q1 " onClick={() => nextHandler(3)}></button>

      <button className="q1 " onClick={() => nextHandler(4)}></button>
      <button className="q1 " onClick={() => nextHandler(5)}></button>
      <button className="q1 " onClick={() => nextHandler(6)}></button>
      <button className="q1 " onClick={() => nextHandler(7)}></button>
      <button className="q1 " onClick={() => nextHandler(8)}></button>
      <button className="q1 " onClick={() => nextHandler(9)}></button>
      <button className="q1 " onClick={() => nextHandler(10)}></button>
    </div>
  );
}
