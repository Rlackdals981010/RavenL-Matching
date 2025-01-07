const express = require('express');
const {
  createNotice,
  getNotices,
  getNotice,
  patchPost,
  deletePost,
} = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 글 생성
router.post('/notice', authMiddleware, createNotice);

// 글 목록 조회
router.get('/notice', getNotices);
// 글 단건 조회
router.get('/notice/:id', getNotice);

// 글 수정
router.patch('/notice/:id',authMiddleware,patchPost)
// 글 삭제
router.delete('/notice/:id', authMiddleware, deletePost);

module.exports = router;