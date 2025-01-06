const express = require('express');
const { signup, adminSignup,login } = require('../controllers/authController');
const router = express.Router();

// 회원가입 라우트 
router.post('/signup', async (req, res) => {
    const { email } = req.body;

    // 인증 코드 생성
    const code = crypto.randomInt(100000, 999999); // 6자리 랜덤 숫자
    verificationCodes[email] = code;

    try {
        // 인증 이메일 전송
        await sendEmail(email, 'Your Verification Code', `Your verification code is: ${code}`);
        res.status(200).json({ message: 'Verification email sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send verification email.' });
    }
});
// 관리자 회원가입
router.post('/signup/admin', adminSignup);
// 로그인 라우트 
router.post('/login', login);

module.exports = router;
