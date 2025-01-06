const express = require('express');
const { signup,verifyCode, adminSignup,login,requestPasswordReset,resetPassword } = require('../controllers/authController');
const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 인증 코드 확인
router.post('/verify-code', verifyCode);

// 관리자 회원가입
router.post('/signup/admin', adminSignup);
// 로그인 라우트 
router.post('/login', login);

// 비밀번호 까먹음
router.post('/re-password', requestPasswordReset);
// 비밀번호 재설정
router.post('/re-password/new', resetPassword);

module.exports = router;
