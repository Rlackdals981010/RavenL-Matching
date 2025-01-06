const express = require('express');
const {
  createInquiry,
  createNotice,
  getInquirysAdmin,
  getInquirysUser,
  getNotices,
  getInquiry,
  getNotice,
  patchPost,
  deletePost,
} = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 글 생성
router.post('/inquiry', authMiddleware, createInquiry);
router.post('/notice', authMiddleware, createNotice);

// 글 목록 조회
router.get('/inquiry',authMiddleware, getInquirysUser);
router.get('/inquiry/admin',authMiddleware, getInquirysAdmin);
router.get('/notice', getNotices);

// 글 단건 조회
router.get('/inquiry/:id', authMiddleware, getInquiry);
router.get('/notice/:id', authMiddleware, getNotice);

// 글 수정
router.patch('/post/:id',authMiddleware,patchPost)
// 글 삭제
router.delete('/post/:id', authMiddleware, deletePost);

module.exports = router;