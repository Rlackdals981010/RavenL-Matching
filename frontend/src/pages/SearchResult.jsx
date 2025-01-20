import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Home.css"
import "./SearchResult.css"
import homeOn from "../assets/home-on.png"
import homeOff from "../assets/home-off.png"
import chatOn from "../assets/chat-on.png"
import chatOff from "../assets/chat-off.png"
import mypageIcon from "../assets/mypage.png"
import { parseJWT } from "../utils/jwt" // parseJWT 가져오기

const SearchResultPage = () => {
  const [activeTab, setActiveTab] = useState("home")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: "", email: "" })
  const [showMyPagePopup, setShowMyPagePopup] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const contactsPerPage = 10 // 한 페이지에 표시할 컨택 수
  const navigate = useNavigate()
  const location = useLocation()

  // 전달된 데이터
  const contacts = location.state?.results || [] // Home.jsx에서 전달된 검색 결과
  const totalContacts = contacts.length // 전체 컨택 수

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
      // 사용자 정보 가져오기
      const parsedToken = parseJWT(token)
      setUserInfo({
        name: parsedToken?.name || "Unknown",
        email: parsedToken?.email || "No Email",
      })
    }
  }, [])

  // 현재 페이지에 해당하는 데이터 계산
  const startIndex = (currentPage - 1) * contactsPerPage
  const endIndex = startIndex + contactsPerPage
  const currentContacts = contacts.slice(startIndex, endIndex)

  const totalPages = Math.ceil(totalContacts / contactsPerPage)

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (tab === "home") navigate("/")
    else if (tab === "chat") navigate("/chat")
  }

  const handleMyPageClick = () => setShowMyPagePopup(!showMyPagePopup)

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setShowMyPagePopup(false)
    navigate("/")
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

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
            Contact <span>{totalContacts}</span>
          </h2>
          <div className="research-content-box">
            {/* 테이블 구조 */}
            <table>
              <thead>
                <tr>
                  <th>Name / Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Product</th>
                  <th>Email</th>
                  <th>컨택수</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="research-results">
                {totalContacts > 0 ? (
                  currentContacts.map((contact, i) => (
                    <tr key={i}>
                      <td>
                        <div className="name-position">
                          <div>{contact.name}</div>
                          <div className="position">{contact.position}</div>
                        </div>
                      </td>
                      <td>{contact.company}</td>
                      <td>{contact.region}</td>
                      <td>{contact.product}</td>
                      <td>{contact.email}</td>
                      <td>{contact.score}</td>
                      <td>
                        <button className="chatting-button">Chatting</button>
                      </td>
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
            {totalContacts > 0 && (
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
  )
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="pagination">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
      Previous
    </button>
    {Array.from({ length: totalPages }, (_, index) => (
      <button key={index} className={currentPage === index + 1 ? "active" : ""} onClick={() => onPageChange(index + 1)}>
        {index + 1}
      </button>
    ))}
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
      Next
    </button>
  </div>
)

export default SearchResultPage

