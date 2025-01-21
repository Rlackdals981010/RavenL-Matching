import { useState } from "react";
import "./Repassword.css";
import { apiFetch } from "../utils/apiFetch"; // apiFetch 가져오기
import logo from "../assets/logo1-1.png";
import { useNavigate } from "react-router-dom"; // useNavigate 가져오기

export default function Repassword() {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // 메시지 타입 추가 (success 또는 error)
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // useNavigate 초기화

    const handleSendEmail = async () => {
        if (!email) {
            setMessage("Please enter a valid email.");
            setMessageType("error");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            const response = await apiFetch("/auth/re-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            setMessage(response.message || "Password reset token sent to email.");
            setMessageType("success");
            setIsCodeSent(true);
        } catch (error) {
            console.error("Error sending email:", error.message);
            setMessage("Failed to send email. Please try again.");
            setMessageType("error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!token) {
            setMessage("Please enter the verification code.");
            setMessageType("error");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            const response = await apiFetch("/auth/re-password/code", {
                method: "POST",
                body: JSON.stringify({ token }),
            });
            localStorage.setItem("token", response.token); // JWT 토큰 저장
            setMessage("Verification successful! Proceeding to next step.");
            setMessageType("success");
            navigate("/auth/re-password/new"); // 비밀번호 변경 페이지로 이동
        } catch (error) {
            console.error("Error verifying code:", error.message);
            setMessage("Invalid verification code. Please try again.");
            setMessageType("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <div className="forget-password-subtitle">
                        Forget Password?
                    </div>
                </div>

                <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <div className="input-with-button">
                            <input
                                type="text"
                                placeholder="Enter your email"
                                className="login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                type="button"
                                className={`send-button ${email ? "active" : ""}`}
                                onClick={handleSendEmail}
                                disabled={!email || isLoading}
                            >
                                {isLoading ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div>
                            <div className="input-group">
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        placeholder="Enter verification code"
                                        className="login-input"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className={`send-button ${token ? "active" : ""}`}
                                        onClick={handleVerifyCode}
                                        disabled={!token || isLoading}
                                    >
                                        {isLoading ? "Verifying..." : "Next"}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="resend-button"
                                onClick={handleSendEmail}
                                disabled={isLoading}
                                style={{
                                    marginTop: "10px",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    color: "#2563eb",
                                    cursor: "pointer",
                                }}
                            >
                                Resend
                            </button>
                        </div>
                    )}

                    {message && <div className={`message ${messageType}`}>{message}</div>}
                </form>
            </div>
        </div>
    );
}