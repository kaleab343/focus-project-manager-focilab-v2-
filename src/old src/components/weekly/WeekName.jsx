import React from "react";
import "./WeekName.css";
function getWeekNumber(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sunday) to 6 (Saturday)
  const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust if Sunday is the first day of the month
  const daysSinceStartOfWeek = date.getDate() + offset - 1;
  return Math.ceil(daysSinceStartOfWeek / 7);
}

function WeekName() {
  const date = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthName = monthNames[date.getMonth()];
  const weekNumber = getWeekNumber(date);

  return (
    <div
      className="week-name-view"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <span>{monthName} | </span> <span>Week {weekNumber}</span>
    </div>
  );
}

export default WeekName;
