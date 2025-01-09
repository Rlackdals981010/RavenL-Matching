const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-payment', paymentController.createPayment);
router.get('/success', paymentController.executePayment);

module.exports = router;