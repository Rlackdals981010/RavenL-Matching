import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";
import "./SearchResult.css";
import homeOn from "../assets/home-on.png";
import homeOff from "../assets/home-off.png";
import chatOn from "../assets/chat-on.png";
import chatOff from "../assets/chat-off.png";
import mypageIcon from "../assets/mypage.png";
import { parseJWT } from "../utils/jwt";

const SearchResultPage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [showMyPagePopup, setShowMyPagePopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 10; // 한 페이지에 표시할 검색 결과 수
  const navigate = useNavigate();
  const location = useLocation();

  // 전달된 데이터
  const results = location.state?.results || []; // SearchResult 데이터를 Home.jsx에서 전달받음
  const totalResults = results.length; // 전체 검색 결과 수

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      const parsedToken = parseJWT(token);
      setUserInfo({
        name: parsedToken?.name || "Unknown",
        email: parsedToken?.email || "No Email",
      });
    }
  }, []);

  // 현재 페이지에 해당하는 데이터 계산
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentResults = results.slice(startIndex, endIndex);

  const totalPages = Math.ceil(totalResults / contactsPerPage);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "home") navigate("/");
    else if (tab === "chat") navigate("/chat");
  };

  const handleMyPageClick = () => setShowMyPagePopup(!showMyPagePopup);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowMyPagePopup(false);
    navigate("/");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <h1 className="home-logo">TravWorlds</h1>
        {isLoggedIn ? (
          <button className="home-mypage-button" onClick={handleMyPageClick}>
            <img src={mypageIcon || "/placeholder.svg"} alt="My Page" className="home-mypage-icon" />
          </button>
        ) : (
          <button className="home-login-button" onClick={() => navigate("/auth")}>
            Sign in
          </button>
        )}
      </header>

      <div className="home-content">
        {/* Sidebar */}
        <div className="home-sidebar">
          <a
            href="/"
            className={`home-sidebar-link ${activeTab === "home" ? "active" : ""}`}
            onClick={() => handleTabClick("home")}
          >
            <img src={activeTab === "home" ? homeOn : homeOff} alt="Home" className="home-sidebar-icon" />
            <span className="home-sidebar-text">Home</span>
          </a>
          <a
            href="/chat"
            className={`home-sidebar-link ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => handleTabClick("chat")}
          >
            <img src={activeTab === "chat" ? chatOn : chatOff} alt="Chat" className="home-sidebar-icon" />
            <span className="home-sidebar-text">Chat</span>
          </a>
        </div>

        {/* Main Content */}
        <div className="research-main-content">
          <h2 className="research-content-title">
            Results <span>{totalResults}</span>
          </h2>
          <div className="research-content-box">
            {/* 테이블 구조 */}
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Brand Product</th>
                  <th>Product URL</th>
                  <th>Category 1</th>
                  <th>Category 2</th>
                  <th>Category 3</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody className="research-results">
                {totalResults > 0 ? (
                  currentResults.map((result, i) => (
                    <tr key={i}>
                      <td>{result.productName || "N/A"}</td>
                      <td>{result.brandProduct || "N/A"}</td>
                      <td>
                        {result.productUrl ? (
                          <a href={result.productUrl} target="_blank" rel="noopener noreferrer">
                            Link
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{result.category1 || "N/A"}</td>
                      <td>{result.category2 || "N/A"}</td>
                      <td>{result.category3 || "N/A"}</td>
                      <td>{result.description || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results-message">
                      No search results found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            {totalResults > 0 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </div>
        </div>
      </div>

      {/* MyPage Popup */}
      {showMyPagePopup && (
        <div className="mypage-popup">
          <div className="mypage-header">
            <img src={mypageIcon || "/placeholder.svg"} alt="Profile" className="mypage-profile-icon" />
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];

    // 항상 첫 페이지 번호 표시
    if (currentPage > 3) {
      pageNumbers.push(
        <button key={1} onClick={() => onPageChange(1)} className={currentPage === 1 ? "active" : ""}>
          1
        </button>
      );
      if (currentPage > 4) pageNumbers.push(<span key="start-ellipsis">...</span>);
    }

    // 현재 페이지를 중심으로 -2 ~ +2 범위의 페이지 번호 표시
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pageNumbers.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }

    // 항상 마지막 페이지 번호 표시
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) pageNumbers.push(<span key="end-ellipsis">...</span>);
      pageNumbers.push(
        <button key={totalPages} onClick={() => onPageChange(totalPages)} className={currentPage === totalPages ? "active" : ""}>
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      {renderPageNumbers()}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  );
};

export default SearchResultPage;