import React from "react";
import "./GoalsSummary.css";
import Nav from "../../components/Nav";
import GoalsList from "../../components/GoalsList";
import html2canvas from "html2canvas";
export default function GoalsSummary() {
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
  return (
    <div className="goals-summary">
      <Nav />
      <h2>Goals Summary</h2>
      <p className="text">
        These are all of your goals with full details and strategies to achieve
        them.
      </p>
      {/* <GoalsList flag={1} /> */}
      <br />
      <br />
      <GoalsList flag={0} />
      <button onClick={downloadJpeg}>download as PDF</button>
    </div>
  );
}
