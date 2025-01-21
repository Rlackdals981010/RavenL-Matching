import React, { useState } from "react";
import "./ResignPage.css";
import { apiFetch } from "../utils/apiFetch";

const ResignPage = () => {
  const [reason, setReason] = useState([]);
  const [additionalComment, setAdditionalComment] = useState("");

  const handleCheckboxChange = (value) => {
    if (reason.includes(value)) {
      setReason(reason.filter((r) => r !== value)); // 선택 취소
    } else {
      setReason([...reason, value]); // 선택 추가
    }
  };

  const handleResign = async () => {
    try {
      await apiFetch("/mypage/resign", {
        method: "POST",
        body: JSON.stringify({ reason, comment: additionalComment }),
      });

      alert("Your account has been deactivated.");
      localStorage.removeItem("token"); // 로그아웃 처리
      window.location.href = "/"; // 홈으로 이동
    } catch (error) {
      console.error("Error processing resignation:", error.message);
    }
  };

  return (
    <div className="resign-container">
      <h1>Resign</h1>
      <p>Why do you want to leave? We will strive to provide better services.</p>
      <div className="checkbox-group">
        {[
          "Have low credibility",
          "Be underused",
          "Be difficult to contact",
          "Lack matching information",
          "Worried about my personal information",
          "Others (directly input)",
        ].map((option, idx) => (
          <label key={idx}>
            <input
              type="checkbox"
              value={option}
              checked={reason.includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
      <textarea
        placeholder="Please enter the contents."
        value={additionalComment}
        onChange={(e) => setAdditionalComment(e.target.value)}
      ></textarea>
      <button onClick={handleResign}>Leave</button>
    </div>
  );
};

export default ResignPage;