import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RePassword from "./pages/Repassword";
import NewPassword from "./pages/Newpassword";
import Signup from "./pages/Signup";
import ChatPage from "./pages/ChatPage"; // ChatPage 추가
import SearchPage from "./pages/SearchResult";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />      {/* 홈 페이지 */}
        <Route path="/auth" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/auth/forget-password" element={<RePassword />} /> {/* 코드 발급 페이지 */}
        <Route path="/auth/re-password/new" element={<NewPassword />} /> {/* 비번 변경 페이지 */}
        <Route path="/signup" element={<Signup />} /> {/* 회원가입 페이지 */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
};

export default App;