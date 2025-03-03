import axios from "axios";
import React, { useState } from "react";

export default function Register() {
  const [visitedBefore, setVisitedBefore] = useState(false);
  const hasVisitedBefore = localStorage.getItem("visitedBefore");

  useState(() => {
    if (hasVisitedBefore) {
      // If the user has visited before, set the state accordingly
      setVisitedBefore(true);
    } else {
      // If it's the user's first visit, set the flag in localStorage
      localStorage.setItem("visitedBefore", "true");

      addUser("planner", "planner@gmail.com", "planner");
    }
  }, []);
  async function addUser(name, email, info) {
    try {
      // Make a POST request to the endpoint to add a user
      const response = await axios.post(
        "https://foci-server.vercel.app/users",
        {
          name,
          email,
          info,
        }
      );

      // Check if the request was successful
      if (response.status === 201) {
        // Return the newly added user data
        const newUser = response.data.user;

        // Set the user ID into local storage
        localStorage.setItem("user_id", newUser._id);
        return response.data.user;
      } else {
        // If the request was not successful, log the error
        console.error("Failed to add user:", response.data.error);
        return null;
      }
    } catch (error) {
      // If an error occurs during the request, log the error
      console.error("Failed to add user:", error.message);
      return null;
    }
  }
  return <div></div>;
}
