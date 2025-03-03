import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <div className="hero">
      <div className="blue-bg"></div>
      <img src="/fociLogo.png" alt="Foci Lab" className="logo" />
      <img className="hero-img" src="/mac.png" alt="hero" />
      <img
        className="header"
        src="/heroHeader.png"
        alt="FlowState On Command"
      />
      <a href="https://chromewebstore.google.com/detail/focilab/mkgehmmjddnfooiheplkcgbgonmeialc">
        <img className="download" src="/downloadButton.png" alt="Download" />
      </a>
    </div>
  );
}
