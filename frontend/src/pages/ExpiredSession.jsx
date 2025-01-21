import React from "react";
import { useNavigate } from "react-router-dom";
import "./ExpiredSession.css";

const ExpiredSession = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth"); // 로그인 페이지로 이동
  };

  return (
    <div className="expired-container">
      <div className="expired-box">
        <h1>Session Expired</h1>
        <p>Your session has expired. Please log in again to continue.</p>
        <button className="expired-login-button" onClick={handleLoginClick}>
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default ExpiredSession;