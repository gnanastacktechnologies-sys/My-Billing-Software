const express = require('express');
const { login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login', login);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
