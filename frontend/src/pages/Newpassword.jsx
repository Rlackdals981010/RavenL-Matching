import { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기
import "./Newpassword.css";
import api from "../utils/api";
import logo from "../assets/logo1-1.png";
import showOn from "../assets/show-on.png";
import showOff from "../assets/show-off.png";

export default function NewPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // useNavigate 초기화
    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            setMessage("Please fill in both fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setMessage("");

        try {
            const token = localStorage.getItem("token"); // JWT 토큰 가져오기
            await api.post(
                "/auth/re-password/new",
                { newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Authorization 헤더 설정
                    },
                }
            );
            setMessage("Password changed successfully!");
            navigate("/auth");
        } catch (error) {
            setMessage("Failed to change password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="repassword-container">
            <div className="repassword-box">
                <div className="repassword-header">
                    <img src={logo} alt="Logo" className="repassword-logo" />
                    <h2 className="repassword-title">Changing Passwords</h2>
                </div>
                <form className="repassword-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                className="repassword-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                            >
                                <img
                                    src={showPassword ? showOff : showOn}
                                    alt={showPassword ? "Hide Password" : "Show Password"}
                                    className="password-toggle-icon"
                                />
                            </button>
                        </div>
                        <small className="input-hint">영문, 숫자, 특수문자 포함 8~16자</small>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password Check</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Enter your Password"
                                className="repassword-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle"
                            >
                                <img
                                    src={showConfirmPassword ? showOff : showOn}
                                    alt={showConfirmPassword ? "Hide Password" : "Show Password"}
                                    className="password-toggle-icon"
                                />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="change-button"
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                    >
                        {isLoading ? "Changing..." : "Change"}
                    </button>

                    {message && <div className="message">{message}</div>}
                </form>
            </div>
        </div>
    );
}