const express = require('express');
const { signup,verifyCode, adminSignup,login,requestPasswordReset,resetPassword,setPassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 인증 코드 확인
router.post('/verify-code', verifyCode);

// 관리자 회원가입
router.post('/signup/admin', adminSignup);
// 로그인 라우트 
router.post('/login', login);

// 비밀번호 잊음 -> 이메일로 코드 발송
router.post('/re-password', requestPasswordReset);
// 비밀번호 잊음 -> 코드 입력
router.post('/re-password/code', resetPassword);
// 비밀번호 재입력
router.post('/re-password/new', authMiddleware,setPassword);

module.exports = router;
