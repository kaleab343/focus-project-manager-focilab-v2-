import React, { useState } from "react";
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import "./Slide.css";
const Slide = () => {
  const images = ["/we.png", "/mo.png", "/daily.png", "/daily.png"];
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    setIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="slide">
      <FaArrowAltCircleLeft onClick={handlePrev} className="pre" />

      <img src={images[index]} alt={`Slide ${index}`} />

      <FaArrowAltCircleRight onClick={handleNext} className="next" />
    </div>
  );
};

export default Slide;
