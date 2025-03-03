import React, { useEffect, useState } from "react";
import "./Ad.css";
import { Link } from "react-router-dom";
export default function Ad() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  useEffect(() => {
    // Function to update screenWidth state when the window is resized
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Attach the event listener for window resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array ensures that useEffect runs only once, similar to componentDidMount
  useEffect(() => {
    getClassNames();
  }, [screenWidth]);
  // Define your logic to determine class names based on screen width
  const getClassNames = () => {
    let adCont = document.getElementById("ad-container");
    let ad = document.getElementById("ad");

    if (screenWidth < 1160) {
      adCont.classList.remove("wide-ad-cont");
      ad.classList.remove("wide-ad");
    } else if (screenWidth >= 1160) {
      adCont.classList.add("wide-ad-cont");
      ad.classList.add("wide-ad");
    }
  };
  return (
    <div className="ad-container" id="ad-container">
      <div className="ad" id="ad">
        <img src="logo-dark-rewire.svg" alt="rewire" />
        <p>
          This program is a part of Rewire. If you want to take things to the
          next level and get all the tools you need to turn your future into a
          reality, check out our course.
        </p>
        <Link to="https://rewire-five.vercel.app/" className="button">
          Read More
        </Link>
      </div>
    </div>
  );
}
