import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RePassword from "./pages/Repassword";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />      {/* 홈 페이지 */}
        <Route path="/auth" element={<Login />} /> {/* 로그인 페이지 */}
        <Route path="/auth/forget-password" element={<RePassword />} /> {/* 로그인 페이지 */}
      </Routes>
    </Router>
  );
};

export default App;