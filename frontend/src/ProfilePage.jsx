import { useState, useEffect } from "react";
import defaultImage from "./Images/Profile.jpg";
import ProfileDetailBGImage from "./Images/ii.jpg";
import "./ProfilePage.css";

function ProfilePage() {
  const [profileImg, setProfileImg] = useState(defaultImage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Individual field states
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [mobile, setMobile] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [email, setEmail] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");
  const [qualification, setQualification] = useState("");
  const [drivingLicense, setDrivingLicense] = useState("");
  const [voterId, setVoterId] = useState("");
  const [smartCard, setSmartCard] = useState("");
  const [passport, setPassport] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  // Edit modes - Section based
  const [editPersonal, setEditPersonal] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [editIdentity, setEditIdentity] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("user_token");
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setFullName(data.name || "");
        setEmail(data.email || "");
        setDob(data.dob || "");
        setBloodGroup(data.bloodGroup || "");
        setMobile(data.mobile || "");
        setAltMobile(data.altMobile || "");
        setAadhar(data.aadhar || "");
        setPan(data.pan || "");
        setQualification(data.qualification || "");
        setDrivingLicense(data.drivingLicense || "");
        setVoterId(data.voterId || "");
        setSmartCard(data.smartCard || "");
        setPassport(data.passport || "");
        setBankAccount(data.bankAccount || "");
        if (data.profileImg) {
          setProfileImg(data.profileImg);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updates) => {
    try {
      const token = localStorage.getItem("user_token");
      if (!token) return;

      // Construct the full object to save, or just send the updates if backend supports partial (it does via merging in controller)
      // The controller expects a User object and updates fields that are not null.
      // So we can just send the field we want to update.

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        console.error("Failed to save profile");
        setError("Failed to save changes");
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error saving profile", err);
      setError("Error saving changes");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfileImg(base64);
        saveProfile({ profileImg: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionSave = (sectionName) => {
    if (sectionName === 'personal') {
      if (editPersonal) {
        // Save personal details
        saveProfile({
          name: fullName,
          dob,
          bloodGroup,
          qualification
        });
      }
      setEditPersonal(!editPersonal);
    } else if (sectionName === 'contact') {
      if (editContact) {
        // Save contact details
        saveProfile({
          mobile,
          altMobile
        });
      }
      setEditContact(!editContact);
    } else if (sectionName === 'identity') {
      if (editIdentity) {
        // Save identity details
        saveProfile({
          aadhar,
          pan,
          drivingLicense,
          voterId,
          smartCard,
          passport,
          bankAccount
        });
      }
      setEditIdentity(!editIdentity);
    }
  };


  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page-container"
      style={{
        backgroundImage: `url(${ProfileDetailBGImage})`,
      }}
    >
      <div className="profile-overlay">
        {/* Header Section */}
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <label htmlFor="profileUpload" className="avatar-label">
              <img src={profileImg} alt="Profile" className="profile-avatar" />
              <div className="avatar-overlay">📷</div>
            </label>
            <input
              type="file"
              id="profileUpload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>
          <h1 className="profile-title">
            {fullName ? `${fullName}'s Profile` : "My Profile"}
          </h1>
          <p className="profile-subtitle">Manage your personal information and identity proofs</p>
        </div>

        {/* Error Message */}
        {error && <div className="error-banner">{error}</div>}

        {/* Main Content Grid */}
        <div className="profile-grid">

          <div className="profile-row-top">
            {/* Card 1: Personal Details */}
            <section className="profile-card">
              <h2 className="card-heading">
                <span>👤 Personal Details</span>
                <button
                  className={`section-edit-btn ${editPersonal ? 'saving' : ''}`}
                  onClick={() => handleSectionSave('personal')}
                >
                  {editPersonal ? "Save Changes" : "Edit"}
                </button>
              </h2>
              <div className="card-content">

                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!editPersonal}
                      className={editPersonal ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Date of Birth</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      disabled={!editPersonal}
                      className={editPersonal ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Blood Group</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      disabled={!editPersonal}
                      className={editPersonal ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Qualification</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      disabled={!editPersonal}
                      className={editPersonal ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Card 2: Contact Information */}
            <section className="profile-card">
              <h2 className="card-heading">
                <span>📞 Contact Info</span>
                <button
                  className={`section-edit-btn ${editContact ? 'saving' : ''}`}
                  onClick={() => handleSectionSave('contact')}
                >
                  {editContact ? "Save Changes" : "Edit"}
                </button>
              </h2>
              <div className="card-content">

                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      value={email}
                      disabled={true}
                      className="input-read locked"
                    />
                    <span className="lock-icon">🔒</span>
                  </div>
                </div>

                <div className="input-group">
                  <label>Mobile Number</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      disabled={!editContact}
                      className={editContact ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Alternate Mobile</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={altMobile}
                      onChange={(e) => setAltMobile(e.target.value)}
                      disabled={!editContact}
                      className={editContact ? "input-edit" : "input-read"}
                    />
                  </div>
                </div>

              </div>
            </section>
          </div>

          {/* Card 3: Identity Proofs */}
          <section className="profile-card full-width">
            <h2 className="card-heading">
              <span>🆔 Identity Proofs</span>
              <button
                className={`section-edit-btn ${editIdentity ? 'saving' : ''}`}
                onClick={() => handleSectionSave('identity')}
              >
                {editIdentity ? "Save Changes" : "Edit"}
              </button>
            </h2>
            <div className="card-grid-2">

              <div className="input-group">
                <label>Aadhar Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={aadhar}
                    onChange={(e) => setAadhar(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>PAN Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Driving License</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Voter ID</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Smart Card</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={smartCard}
                    onChange={(e) => setSmartCard(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Passport</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={passport}
                    onChange={(e) => setPassport(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

              <div className="input-group full-width-input">
                <label>Bank Account</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    disabled={!editIdentity}
                    className={editIdentity ? "input-edit" : "input-read"}
                  />
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
