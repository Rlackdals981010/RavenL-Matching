const express = require('express');
const { queryDatabase } = require('../controllers/searchController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, queryDatabase);

module.exports = router;