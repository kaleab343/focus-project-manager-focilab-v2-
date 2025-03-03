import React, { useState } from "react";
import "./Login.css";
import Nav from "../../components/Nav";
import { useDispatch, useSelector } from "react-redux";
import { Logout, setUser } from "../../features/User";
import { Link } from "react-router-dom";
const Login = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const button = document.getElementById("login-button");
  const loader = document.getElementById("loader");
  const redirect = document.getElementById("login-redirect");
  const onLogin = (data) => {
    console.log(data);
    dispatch(setUser(data));
    console.log(data);
    button.classList.remove("disabled");
  };
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    button.classList.add("disabled");
    loader.classList.remove("hidden");
    console.log("click");
    // Perform API request to login endpoint (e.g., /auth/login)
    const response = await fetch(
      "https://main-server1-kiztopia2020-gmailcom.vercel.app/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      button.classList.remove("disabled");
      loader.classList.add("hidden");
      onLogin(data.user);
      redirect.click();
    } else {
      setUsername("");
      setPassword("");
      button.classList.remove("disabled");
      loader.classList.add("hidden");
    }
  };

  return (
    <div className="login">
      <Nav />
      <div className="login-form-container">
        <div className="login-form">
          <h2>Login</h2>
          <div>
            <label htmlFor="email">Email</label>

            <input
              type="email"
              name="email"
              id="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>

            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleLogin} id="login-button">
            Login
          </button>
          <p className="loader hidden" id="loader">
            Please Wait. Loading ...
          </p>
          <Link
            to="/getting-started"
            className="hidden"
            id="login-redirect"
          ></Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
