const express = require('express');
const { addMark, removeMark, getMarks } = require('../controllers/markController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 마크 추가
router.post('/', authMiddleware, addMark);

// 마크 제거
router.delete('/:targetId', authMiddleware, removeMark);

// 마크 목록 조회
router.get('/:type', authMiddleware, getMarks);

module.exports = router;