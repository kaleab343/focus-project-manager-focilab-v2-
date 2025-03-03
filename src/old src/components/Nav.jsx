import React from "react";
import "./Nav.css";
import { Link } from "react-router-dom";
import { SignOutButton, SignedIn } from "@clerk/clerk-react";
export default function Nav(props) {
  const display = () => {
    if (props.dark) {
      return (
        <div className="nav">
          <Link to={"/"}>
            <img className="logo padding" src="./logo-dark.svg" alt="" />
          </Link>
          <SignedIn>
            <SignOutButton afterSignOutUrl="/" className="button" />
          </SignedIn>
        </div>
      );
    } else {
      return (
        <div className="nav">
          <Link to={"/"}>
            <img className="logo" src="./logo.svg" alt="" />
          </Link>
          <SignedIn>
            <SignOutButton afterSignOutUrl="/" className="button" />
          </SignedIn>
        </div>
      );
    }
  };
  return <div className="nav">{display()}</div>;
}
