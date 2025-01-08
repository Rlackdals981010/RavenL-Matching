const express = require('express');
const { testController } = require('../controllers/testController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, testController);

module.exports = router;