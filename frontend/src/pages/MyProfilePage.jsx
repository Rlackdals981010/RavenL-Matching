import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "./MyProfilePage.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";
import mypageIcon from "../assets/mypage.png";
import { parseJWT } from "../utils/jwt";
import { apiFetch } from "../utils/apiFetch";

const MyProfilePage = () => {
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    company: "",
    position: "",
    region: "",
    product: "",
    job: "Buyer",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMyPagePopup, setShowMyPagePopup] = useState(false);
  const [activeTab, setActiveTab] = useState("mypage");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    setIsLoggedIn(true);
    const parsedToken = parseJWT(token);
    if (parsedToken) {
      setUserInfo((prev) => ({
        ...prev,
        email: parsedToken.email || "",
        name: parsedToken.name || "",
      }));
    }

    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/mypage/info");
        setUserInfo(data);
      } catch (error) {
        console.error("Profile fetch error:", error.message);
        localStorage.removeItem("token");
        navigate("/auth");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowMyPagePopup(false);
    navigate("/auth");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/");
    else if (tab === "chat") navigate("/chat");
  };

  const handleSave = async () => {
    try {
      await apiFetch("/mypage/info", {
        method: "PUT",
        body: JSON.stringify(userInfo),
      });
      alert("Profile updated successfully! You will be logged out.");
      handleLogout();
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }

    try {
      await apiFetch("/mypage/password", {
        method: "PUT",
        body: JSON.stringify({
          oldPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      alert("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
      handleLogout();
    } catch (error) {
      console.error("Error updating password:", error.message);
      setPasswordError(error.message);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="home-logo">TravWorlds</h1>
        {isLoggedIn && (
          <button
            className="home-mypage-button"
            onClick={() => setShowMyPagePopup(!showMyPagePopup)}
          >
            <img src={mypageIcon} alt="MyPage" className="home-mypage-icon" />
          </button>
        )}
      </header>

      <div className="home-content">
        <div className="home-sidebar">
          <a
            href="/"
            className={`home-sidebar-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => handleTabClick("home")}
          >
            <img
              src={activeTab === "home" ? homeOn : homeOff}
              alt="Home"
              className="home-sidebar-icon"
            />
            <span className="home-sidebar-text">Home</span>
          </a>
          <a
            href="/chat"
            className={`home-sidebar-link ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => handleTabClick("chat")}
          >
            <img
              src={activeTab === "chat" ? chatOn : chatOff}
              alt="Chat"
              className="home-sidebar-icon"
            />
            <span className="home-sidebar-text">Chat</span>
          </a>
        </div>

        <div className="myprofile-container">
          <div className="myprofile-box">
            <h2 className="myprofile-title">My Profile</h2>
            <div className="myprofile-form">
              <div className="myprofile-input-group">
                <label>Email</label>
                <input type="email" value={userInfo.email} readOnly />
              </div>
              <div className="myprofile-input-group">
                <label>Name</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
              </div>
              <div className="myprofile-input-group">
                <label>Company</label>
                <input
                  type="text"
                  value={userInfo.company}
                  onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                />
              </div>
              <div className="myprofile-input-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={userInfo.position}
                  onChange={(e) => setUserInfo({ ...userInfo, position: e.target.value })}
                />
              </div>
              <div className="myprofile-input-group">
                <label>Location</label>
                <input
                  type="text"
                  value={userInfo.region}
                  onChange={(e) => setUserInfo({ ...userInfo, region: e.target.value })}
                />
              </div>
              <div className="myprofile-input-group">
                <label>Product Type</label>
                <input
                  type="text"
                  value={userInfo.product}
                  onChange={(e) => setUserInfo({ ...userInfo, product: e.target.value })}
                />
              </div>
              <div className="myprofile-purpose-options">
                <button
                  className={`myprofile-purpose-button ${
                    userInfo.job === "Buyer" ? "selected" : ""
                  }`}
                  onClick={() => setUserInfo({ ...userInfo, job: "Buyer" })}
                >
                  Buyer
                </button>
                <button
                  className={`myprofile-purpose-button ${
                    userInfo.job === "Seller" ? "selected" : ""
                  }`}
                  onClick={() => setUserInfo({ ...userInfo, job: "Seller" })}
                >
                  Seller
                </button>
              </div>
              <button className="myprofile-save-button" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>

          <div className="myprofile-password-section">
            <h2>Change Password</h2>
            <div className="myprofile-input-group">
              <label>Current Password</label>
              <input
                type="password"
                placeholder="Enter your Current Password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
              />
            </div>
            <div className="myprofile-input-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter your New Password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="myprofile-input-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm your New Password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            {passwordError && <p className="password-warning">{passwordError}</p>}
            <button className="myprofile-save-button" onClick={handlePasswordChange}>
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;