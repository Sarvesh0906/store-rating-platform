const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { accessController } = require('../controllers/roleController');

const router = express.Router();

router.get('/admin', authenticateUser, authorizeRoles('SYSTEM_ADMIN'), accessController('System admin'));
router.get('/user', authenticateUser, authorizeRoles('NORMAL_USER'), accessController('Normal user'));
router.get('/owner', authenticateUser, authorizeRoles('STORE_OWNER'), accessController('Store owner'));

module.exports = router;
