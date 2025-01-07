const express = require('express');
const {contact, contactSent, contactReceive, changeState, score, sendMessage } = require('../controllers/contactController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/contact',authMiddleware, contact);
router.get('/contact/sent',authMiddleware, contactSent);
router.get('/contact/received',authMiddleware, contactReceive);

router.patch('/contact/:id/accept',authMiddleware, changeState);

router.patch('/contact/:id',authMiddleware, score);

module.exports = router;
