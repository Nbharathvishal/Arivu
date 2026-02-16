import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registration.css";
import registerPageImage from "./images/registerPageImage.jpg";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // validations (already correct)
    if (!form.name || !form.email || !form.password) {
      setError("Please fill all fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Enter a valid email.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Registration failed");
      }

      // ✅ SUCCESS — redirect to login
      localStorage.removeItem("user_token");
      localStorage.removeItem("user_data");
      alert("Registration successful! Please login.");
      nav("/login");

    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div className="signup-page"
      style={{
        backgroundImage: `url(${registerPageImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}>
      <div className="bubbles" aria-hidden="true">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
        <span className="bubble b5" />

      </div>

      <div className="signup-wrap" role="main" aria-label="Sign up">
        <h1 className="headline">SignUp Form</h1>

        <div className="signup-panel">
          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Username"
              className="input"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="input"
            />
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="input"

            />
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="input"
            />



            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="cta" >SIGNUP</button>
            <p className="login-line">Already have an account <button type="button" className="linkish" onClick={() => nav("/login")}>Login Now!</button></p>
          </form>
        </div>

        <footer className="signup-footer">© {new Date().getFullYear()} BrainVault Signup Form. All rights reserved.</footer>
      </div>
    </div>
  );
}
