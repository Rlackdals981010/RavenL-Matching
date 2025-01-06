const express = require('express');
const { logQuery } = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, logQuery);

module.exports = router;