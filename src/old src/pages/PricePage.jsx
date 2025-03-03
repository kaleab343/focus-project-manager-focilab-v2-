import React, { useState } from "react";
import "./PricePage.css";
import { FaXTwitter } from "react-icons/fa6";
import { SiGumroad } from "react-icons/si";

export default function PricePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBuyClick = () => {
    setShowConfirmation(true);
  };

  const handleCloseClick = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="app">
      <div className="price-page">
        <h1>Get the best creators planner now!</h1>
        <ul>
          <li>Todo List</li>
          <li>Weekly Planner</li>
          <li>Daily Planner</li>
          <li>Pomodoro Timer</li>
          <li>Deep work analytics</li>
          <li>Be the first to get new features and updates!</li>
        </ul>
        <div className="price">
          {/* <div className="monthly">
            <p>$4.99</p>
            <span>per month</span>
            <button onClick={handleBuyClick}>Buy</button>
          </div> */}
          <div className="life-time">
            <p>
              <span>$10</span>
            </p>
            <small>Early Birds Discount</small>
            <span>Life Time Access. </span>
            <button onClick={handleBuyClick}>Lets do it</button>
          </div>
        </div>
        {showConfirmation && (
          <div className="confirmation">
            <h1>Payment Options</h1>
            <p>
              Hi I am Kirubel the founder of FociLab. Currently we are accepting
              payments through my personal PayPal.
            </p>
            <p>
              Send me a direct message on 𝕏 then I will give you my PayPal
              account and I will give you your activation code.( click below )
            </p>
            <div className="cont">
              <div className="one">
                <a
                  href="https://twitter.com/messages/compose?recipient_id=1704061131248021504"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaXTwitter />
                  <p>Send me Direct Message</p>
                </a>
              </div>
              <div>
                <SiGumroad />
                <p>
                  <a href="https://thekirubel.gumroad.com/l/pxbwd">
                    Buy from Gumroad now
                  </a>
                </p>
              </div>
            </div>
            <button className="close" onClick={handleCloseClick}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
