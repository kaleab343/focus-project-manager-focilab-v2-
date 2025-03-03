import React, { useEffect, useState } from "react";
import "./Popup.css";

const Popup = ({ threshold = 600 }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const screenWidth = window.innerWidth;
      const isSmallScreen = screenWidth < threshold;

      // Check if the pop-up has been displayed before
      const hasPopupBeenDisplayed = localStorage.getItem("popup");

      if (isSmallScreen && !hasPopupBeenDisplayed) {
        setShowPopup(true);
        localStorage.setItem("popup", "displayed");
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [threshold]);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    showPopup && (
      <div className="popup">
        <div className="popup-content">
          <p>
            Your screen size is too small. Please consider using a larger screen
            for a better experience.
          </p>
          <button onClick={handlePopupClose}>Close</button>
        </div>
      </div>
    )
  );
};

export default Popup;
