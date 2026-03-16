// Login.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./loginpage.css";
import loginPageImage from './Images/Login.jpg';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  
  const restartEntrance = () => {
    const page = containerRef.current;
    if (!page) return;
    page.classList.remove("enter");
    
    void page.offsetWidth;
    page.classList.add("enter");
    
    document.documentElement.classList.remove("paused-anim");
  };

  
  useEffect(() => {
    const stored = localStorage.getItem("rememberedEmail");
    if (stored) {
      setEmail(stored);
      setRemember(true);
    }

    // initial entrance
    restartEntrance();

    // handlers
    const onVisibility = () => {
      if (document.hidden) {
        document.documentElement.classList.add("paused-anim");
      } else {
        // when tab becomes visible again, resume and restart entrance
        document.documentElement.classList.remove("paused-anim");
        restartEntrance();
      }
    };

    const onFocus = () => {
      
      document.documentElement.classList.remove("paused-anim");
      restartEntrance();
    };

    const onBlur = () => {
      document.documentElement.classList.add("paused-anim");
    };

    const onResize = () => {
      // debounce resize to avoid spamming restarts
      if (onResize._t) clearTimeout(onResize._t);
      onResize._t = setTimeout(() => {
        document.documentElement.classList.remove("paused-anim");
        restartEntrance();
      }, 120);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      if (onResize._t) clearTimeout(onResize._t);
      document.documentElement.classList.remove("paused-anim");
      const page = containerRef.current;
      if (page) page.classList.remove("enter");
    };
    
  }, []);

  
  useEffect(() => {
    restartEntrance();
   
  }, [location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      setError("⚠️ Please enter a valid email address!");
      return;
    }
    if (!password || password.length < 6) {
      setError("⚠️ Password must be at least 6 characters!");
      return;
    }

    if (remember) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
             localStorage.setItem("user_token", data.accessToken);
             localStorage.setItem("user_data", JSON.stringify(data));
             setError("");
             navigate("/MainPage");
        } else {
            setError(data.message || "Login failed. Please check your credentials.");
        }
    } catch (err) {
        console.error("Login error:", err);
        setError("Network error. Is the backend running?");
    }
  };

  return (
    <div
      ref={containerRef}
      className="login-page animated-bg"
      style={{ ["--bg-url"]: `url(${loginPageImage})` }}
    >
      <div className="bubbles" aria-hidden="true">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
        <span className="bubble b5" />
      </div>

      <div className="login-wrap" role="main" aria-label="Login to Arivu / BrainVault">
        <div className="login-panel">
          <h2 className="login-title">Login Here</h2>
<form className="login-form" onSubmit={handleLogin} noValidate>

  {/* EMAIL */}
  <div className="form-group">
    <label>Email</label>
    <input
      className="input"
      type="email"
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>

  {/* PASSWORD */}
  <div className="form-group">
    <label>Password</label>
    <div className="pw-wrapper">
      <input
        className="input"
        type={show ? "text" : "password"}
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        className="show-btn"
        onClick={() => setShow(!show)}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
  </div>

  
  <div className="row-between">
    <label className="remember">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => setRemember(e.target.checked)}
      />
      Remember me
    </label>

    <button
  type="button"
  className="forgot"
  onClick={() => {
    if (!email) {
      setError("Please enter your email first");
      return;
    }

    navigate("/reset-password", {
      state: { email: email }
    });
  }}
>
  Forgot?
</button>

  </div>

  {error && <div className="form-error">{error}</div>}

  <button className="btn login-cta" type="submit">
    Login
  </button>

  <p className="alt-line">
    New here? <Link to="/register" className="linkish">Create account</Link>
  </p>

</form>

        </div>
      </div>
    </div>
  );
}
