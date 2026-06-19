const express = require('express');
const {
  signupController,
  loginController,
  logoutController,
  meController,
  changePasswordController,
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later',
});

router.post('/signup', authRateLimit, signupController);
router.post('/login', authRateLimit, loginController);
router.post('/logout', authenticateUser, logoutController);
router.get('/me', authenticateUser, meController);
router.put('/change-password', authenticateUser, changePasswordController);

module.exports = router;
