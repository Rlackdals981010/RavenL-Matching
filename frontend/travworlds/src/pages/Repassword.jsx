import { useState, useEffect } from "react";
import "./Repassword.css";
import api from "../utils/api"; // Axios 인스턴스 가져오기
import logo from "../assets/logo1-1.png";

export default function Repassword() {
    const [email, setEmail] = useState("");
    const [token, settoken] = useState("");
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmail = async () => {
        if (!email) {
            setMessage("Please enter a valid email.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            // 이메일 전송 API 호출
            const response = await api.post("/auth/re-password", { email }); // 서버의 라우트와 일치
            setMessage(response.message);
            setIsCodeSent(true);
        } catch (error) {
            setMessage("Failed to send email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!token) {
            setMessage("Please enter the verification code.");
            return;
        }
        setIsLoading(true);
        setMessage("");
        try {
            // 코드 검증 API 호출
            const response = await api.post("/auth/re-password/code", {  token });
            setMessage("Verification successful! Proceeding to next step.");
        } catch (error) {
            setMessage("Invalid verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="login-logo" />
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
                                className="send-button"
                                onClick={handleSendEmail}
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>

                    {isCodeSent && (
                        <div className="input-group">
                            <div className="input-with-button">
                                <input
                                    type="text"
                                    placeholder="Enter verification code"
                                    className="login-input"
                                    value={token}
                                    onChange={(e) => settoken(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="send-button"
                                    onClick={handleVerifyCode}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Verifying..." : "Next"}
                                </button>
                            </div>
                        </div>
                    )}

                    {message && <div className="message">{message}</div>}
                </form>
            </div>
        </div>
    );
}