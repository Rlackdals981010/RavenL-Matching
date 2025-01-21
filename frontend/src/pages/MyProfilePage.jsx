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

    const [passwordError, setPasswordError] = useState(""); // 에러 메시지 상태 추가
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
                const response = await fetch("http://localhost:5001/mypage/info", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error(`Failed to fetch profile`);
                const data = await response.json();
                setUserInfo(data);
            } catch (error) {
                console.error("Profile fetch error:", error);
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
            const response = await fetch("http://localhost:5001/mypage/info", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(userInfo),
            });

            if (!response.ok) throw new Error("Failed to update profile.");

            alert("Profile updated successfully! You will be logged out.");
            handleLogout(); // 프로필 업데이트 성공 후 로그아웃
        } catch (error) {
            console.error(error);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            alert("New passwords do not match");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/mypage/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    oldPassword: passwords.current,
                    newPassword: passwords.new,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update password.");
            }

            alert("Password updated successfully!");
            setPasswords({ current: "", new: "", confirm: "" });
            handleLogout(); // 성공 시 로그아웃
        } catch (error) {
            console.error(error.message);
            setPasswordError(error.message); // 에러 메시지 저장
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
                        <div className="myprofile-header">
                            <h1 className="myprofile-title">Account & Setting</h1>
                        </div>

                        <div className="myprofile-form">
                            <h2 className="text-lg font-semibold mb-4">My profile</h2>

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

                            <div className="myprofile-input-group">
                                <label>The Purpose of using the platform?</label>
                                <div className="myprofile-purpose-options">
                                    <button
                                        type="button"
                                        className={`myprofile-purpose-button ${userInfo.job.toLowerCase() === "buyer" ? "selected" : ""
                                            }`}
                                        onClick={() => setUserInfo({ ...userInfo, job: "Buyer" })}
                                    >
                                        Buyer
                                    </button>
                                    <button
                                        type="button"
                                        className={`myprofile-purpose-button ${userInfo.job.toLowerCase() === "seller" ? "selected" : ""
                                            }`}
                                        onClick={() => setUserInfo({ ...userInfo, job: "Seller" })}
                                    >
                                        Seller
                                    </button>
                                </div>
                            </div>

                            <button className="myprofile-save-button" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>

                    {/* 비밀번호 변경 섹션 */}
                    <div className="myprofile-password-section">
                        <h2 className="text-lg font-semibold mb-4">Changing Password</h2>

                        <div className="myprofile-input-group">
                            <label>Old Password</label>
                            <input
                                type="password"
                                placeholder="Enter your Current Password"
                                value={passwords.current}
                                onChange={(e) => {
                                    setPasswords({ ...passwords, current: e.target.value });
                                    setPasswordError(""); // 새로운 입력 시 에러 메시지 초기화
                                }}
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
                            <label>New Password Check</label>
                            <input
                                type="password"
                                placeholder="Confirm your New Password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                            {passwords.new !== passwords.confirm && passwords.confirm && (
                                <p className="password-warning">Passwords do not match!</p>
                            )}
                        </div>

                        {passwordError && <p className="password-warning">{passwordError}</p>}

                        <button
                            className="myprofile-save-button"
                            onClick={handlePasswordChange}
                            disabled={!passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm}
                        >
                            Change
                        </button>
                    </div>
                </div>
            </div>

            {showMyPagePopup && (
                <div className="mypage-popup">
                    <div className="mypage-header">
                        <img src={mypageIcon} alt="Profile" className="mypage-profile-icon" />
                        <div>
                            <p className="mypage-name">{userInfo.name}</p>
                            <p className="mypage-email">{userInfo.email}</p>
                        </div>
                    </div>
                    <ul className="mypage-list">
                        <li className="mypage-item">Account & Settings</li>
                        <li className="mypage-item">Plan & Payment</li>
                        <li className="mypage-item">Help Center</li>
                        <li className="mypage-item" onClick={handleLogout}>
                            Log out
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MyProfilePage;