const express = require('express');
const { 
    createReport, 
    getReports, 
    getMineReports,
    getMineReport,
    deleteReport, 
    approveReport, 
    rejectReport 
} = require('../controllers/reportController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// 신고 등록
router.post('/', authMiddleware, createReport);

// 신고 목록 조회 (관리자 전용)
router.get('/', authMiddleware, getReports);

// 내가 등록한 신고 목록 조회
router.get('/my/list',authMiddleware,getMineReports);

// 내가 등록한 신고 단건 조회
router.get('/my/:id',authMiddleware,getMineReport)

// 신고 삭제 (관리자 전용)
router.delete('/:id', authMiddleware, deleteReport);

// 신고 승인 (관리자 전용)
router.patch('/:id/approve', authMiddleware, approveReport);

// 신고 거절 (관리자 전용)
router.patch('/:id/reject', authMiddleware, rejectReport);

module.exports = router;