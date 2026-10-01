import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  // safety
  if (!email) {
    navigate("/login");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    console.log("Reset password for:", email);
    console.log("New password:", password);

    alert("Password changed successfully ✅");
    navigate("/login");
  };

  return (
    <div className="reset-page">
      <form className="reset-box" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        {/* 👇 THIS is what you want */}
        <p className="email-text">
          Changing password for <b>{email}</b>
        </p>

        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
