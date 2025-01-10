const express = require('express');
const {
    createProduct,
    createPlan,
    createSubscription,
    executeSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
} = require('../controllers/paymentController');

const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/product/create', authMiddleware, createProduct); // 제품 생성
router.post('/plan/create', authMiddleware, createPlan); // 플랜 생성
router.post('/subscription/create', authMiddleware, createSubscription); // 구독 생성
router.get('/subscription/success', executeSubscription); // 구독 승인 처리
router.post('/subscription/cancel', cancelSubscription); // 구독 취소 처리
router.post('/subscription/pause', authMiddleware, pauseSubscription); // 갱신 중단
router.post('/subscription/resume', authMiddleware, resumeSubscription); // 구독 재활성화

module.exports = router;