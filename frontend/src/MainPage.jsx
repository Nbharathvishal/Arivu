import React from "react";
import { useNavigate } from "react-router-dom";
import profileImg from "./Images/pp.png";
import documentImg from "./Images/Document.png";
import notesImg from "./Images/Notes.png";
import MainPageImage from "./Images/MainPageImage.jpg";
import "./mainpage.css";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div className="desktop-shell"

      style={{
        backgroundImage: `url(${MainPageImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}>



      <header className="app-title-bar" role="banner">
        <div className="app-title">BrainVault</div>
        <div className="window-controls" aria-hidden="true">
          <button
            className="logout-btn"
            onClick={() => {
              // Clear session
              localStorage.removeItem("user_token");
              localStorage.removeItem("user_data");
              navigate("/Login");
            }}
            title="Logout"
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: '15px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="app-window" role="main" aria-label="Main app window">
        <div className="window-content">
          <h2 className="section-heading">Choose a Section</h2>

          <div className="menu-grid">
            <button
              className="menu-card"
              onClick={() => navigate("/ProfilePage")}
              aria-label="Open Profile"
            >
              <div className="card-icon-wrap">
                <img src={profileImg} alt="Profile icon" className="card-icon-img" />
              </div>
              <div className="card-label">Profile</div>
            </button>

            <button
              className="menu-card"
              onClick={() => navigate("/DocumentPage")}
              aria-label="Open Documents"
            >
              <div className="card-icon-wrap">
                <img src={documentImg} alt="Document icon" className="card-icon-img" />
              </div>
              <div className="card-label">Document</div>
            </button>

            <button
              className="menu-card"
              onClick={() => navigate("/NotesPage")}
              aria-label="Open KeepNotes"
            >
              <div className="card-icon-wrap">
                <img src={notesImg} alt="Notes icon" className="card-icon-img" />
              </div>
              <div className="card-label">Keep Notes</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MainPage;
