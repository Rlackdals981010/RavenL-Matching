import React, { useState, useEffect } from "react";
import "./Login.css";
import api from "../utils/api"; // Axios 인스턴스 가져오기
import logo from "../assets/logo1-1.png";
import showOff from "../assets/show-off.png";
import showOn from "../assets/show-on.png";
import { Link, useNavigate } from "react-router-dom"; // useNavigate 가져오기

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberEmail, setRememberEmail] = useState(false);

    const navigate = useNavigate(); // useNavigate 초기화

    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            setMessage(response.data.message || "Login successful!");

            
            localStorage.removeItem("token");
            // JWT 토큰 저장
            localStorage.setItem("token", response.data.token);
            
            if (rememberEmail) {
                localStorage.setItem("savedEmail", email);
            } else {
                localStorage.removeItem("savedEmail");
            }

            console.log("Login successful:", response.data);
            setIsLoading(false);

            // 로그인 성공 후 메인 페이지로 이동
            navigate("/");
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);
            if (error.response) {
                setMessage(error.response.data.message || "Login failed. Please try again.");
            } else if (error.request) {
                setMessage("Unable to connect to the server. Please check your network.");
            } else {
                setMessage("An error occurred during login. Please try again.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <img src={logo} alt="Logo" className="login-logo" />
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Email"
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                            >
                                <img
                                    src={showPassword ? showOff : showOn}
                                    alt={showPassword ? "Hide password" : "Show password"}
                                    className="password-toggle-icon"
                                    style={{ width: "24px", height: "24px" }}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="remember-forgot">
                        <div className="remember-me">
                            <input
                                type="checkbox"
                                id="remember"
                                className="remember-checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                            />
                            <label htmlFor="remember" className="remember-label">
                                Save Email
                            </label>
                        </div>
                        <div className="forgot-links">
                            <div className="forgot-links">
                                <Link to="/auth/forget-password" className="forgot-link">
                                    Forget Password
                                </Link>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading}>
                        {isLoading ? "Loading..." : "Sign In"}
                    </button>

                    {message && <div className="message">{message}</div>}

                    <div className="signup-prompt">
                        Don't have an account?{" "}
                        <Link to="/signup" className="signup-link">
                            Sign up
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}