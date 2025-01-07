const express = require('express');
const { getUserProfile, resign } = require('../controllers/userController');
const { updateUserProfile, updateUserPassword } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 사용자 정보 조회 (마이페이지)
router.get('/info', authMiddleware, getUserProfile);
// 사용자 정보 수정
router.put('/info', authMiddleware, updateUserProfile);
// 비밀번호 수정
router.put('/password', authMiddleware, updateUserPassword);
// 회원 탈퇴
router.post('/resign',authMiddleware,resign);


module.exports = router;
