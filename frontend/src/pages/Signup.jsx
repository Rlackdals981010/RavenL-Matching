import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "../assets/logo1-1.png";
import showOn from "../assets/show-on.png";
import showOff from "../assets/show-off.png";
import api from "../utils/api";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [location, setLocation] = useState("");
    const [productType, setProductType] = useState("");
    const [purpose, setPurpose] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSendVerificationCode = async () => {
        try {
            setMessage("Sending verification code...");
            await api.post("/auth/signup", { email });
            setMessage("Verification code sent. Check your email.");
        } catch (error) {
            setMessage("Failed to send verification code.");
        }
    };

    const handleVerifyCode = async () => {
        try {
            setMessage("Verifying code...");
            await api.post("/auth/verify-code", { email, code: verificationCode });
            setIsVerified(true);
            setMessage(""); // 성공 메시지 숨김
        } catch (error) {
            setMessage("Invalid or expired verification code.");
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);

        if (password !== value) {
            setErrorMessage("Passwords do not match.");
        } else {
            setErrorMessage("");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        setErrorMessage("");
        setMessage("Signing up...");

        try {
            await api.post("/auth/complete-signup", {
                email,
                password,
                name,
                company,
                position: jobTitle,
                region: location,
                product: productType,
                job: purpose.toLowerCase(),
            });
            navigate("/auth");
        } catch (error) {
            setMessage("Signup failed. Please try again.");
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-header">
                    <img src={logo} alt="Logo" className="signup-logo" />
                    <h2 className="signup-title">Sign up</h2>
                </div>
                <form className="signup-form" onSubmit={handleSignup}>
                    <div className="signup-input-group">
                        <label>Email</label>
                        <div className="signup-input-with-button">
                            <input
                                type="email"
                                placeholder="Enter your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isVerified}
                            />
                            {!isVerified && (
                                <button
                                    type="button"
                                    className="signup-email-button"
                                    onClick={handleSendVerificationCode}
                                >
                                    Send
                                </button>
                            )}
                        </div>
                    </div>
                    {!isVerified && (
                        <div className="signup-input-group">
                            <label>Verification code</label>
                            <div className="signup-input-with-button">
                                <input
                                    type="text"
                                    placeholder="Enter your verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="signup-email-button"
                                    onClick={handleVerifyCode}
                                >
                                    Check
                                </button>
                            </div>
                        </div>
                    )}
                    {isVerified && (
                        <>
                            <div className="signup-input-group">
                                <label>Password</label>
                                <div className="signup-password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="signup-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <img
                                            src={showPassword ? showOff : showOn}
                                            alt={showPassword ? "Hide password" : "Show password"}
                                        />
                                    </button>
                                </div>
                                <small>Include 8-16 characters with letters, numbers, and special symbols.</small>
                            </div>
                            <div className="signup-input-group">
                                <label>Password Check</label>
                                <div className="signup-password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                    />
                                    <button
                                        type="button"
                                        className="signup-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <img
                                            src={showConfirmPassword ? showOff : showOn}
                                            alt={showConfirmPassword ? "Hide password" : "Show password"}
                                        />
                                    </button>
                                </div>
                                {errorMessage && <small style={{ color: "red" }}>{errorMessage}</small>}
                            </div>
                            <div className="signup-input-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="signup-input-group">
                                <label>Company</label>
                                <input
                                    type="text"
                                    placeholder="Enter your company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div className="signup-input-group">
                                <label>Job Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter your job title"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                />
                            </div>
                            <div className="signup-input-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter your Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="signup-input-group">
                                <label>Product Type</label>
                                <input
                                    type="text"
                                    placeholder="Enter your product"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                />
                            </div>
                            <div className="signup-input-group">
                                <label>The Purpose of using the platform?</label>
                                <div className="signup-purpose-options">
                                    <button
                                        type="button"
                                        className={`signup-purpose-button ${purpose === "buyer" ? "selected" : ""}`}
                                        onClick={() => setPurpose("Buyer")}
                                    >
                                        Buyer
                                    </button>
                                    <button
                                        type="button"
                                        className={`signup-purpose-button ${purpose === "seller" ? "selected" : ""}`}
                                        onClick={() => setPurpose("Seller")}
                                    >
                                        Seller
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="signup-button">
                                Sign up
                            </button>
                        </>
                    )}
                    {message && <small className="signup-message">{message}</small>}
                </form>
            </div>
        </div>
    );
}