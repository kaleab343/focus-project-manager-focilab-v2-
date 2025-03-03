import React from "react";
import "./ComingSoon.css";
import { FaXTwitter } from "react-icons/fa6";
export default function ComingSoon() {
  return (
    <div className="coming-soon-page">
      <div className="coming-soon">
        <h1>Coming Soon...</h1>
        <p>
          I'm working on the full planner, and I'll announce it soon once I've
          finished the project. Make sure to follow me on Twitter so that you'll
          be the first to know when the full planner is completed.
        </p>

        <div className="twitter">
          <a href="https://twitter.com/_KirubelD">
            <span>Follow: </span>
            <FaXTwitter />
          </a>
        </div>
      </div>
    </div>
  );
}
