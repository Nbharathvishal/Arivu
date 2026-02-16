import React from 'react';
import { Link } from "react-router-dom";
import frentpageImage from "./Images/newfrentpageImage.jpeg";


function User() {
  return (
    <div
      className="MainPage"
      style={{
        backgroundImage: `url(${frentpageImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {/* semi-transparent overlay to make text readable */}
      <div className="overlay" />

      <div className="center-box" role="main" aria-label="Welcome to BrainVault">
        <div className="mainDiv glass">
          <h1 className="top">Welcome</h1>

          <div className="center">
            <h1 className="mainWord">BrainVault</h1>
          </div>

          <div className="NewMember">
            <h3>New here?</h3>
          </div>

          <Link to="/register" className="reg">
            <button className="btn primary">Register</button>
          </Link>

          <div className="else">
            <h5>-------Or--------</h5>
            <Link to="/Login" className="log">
              <button className="btn ghost">Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;
