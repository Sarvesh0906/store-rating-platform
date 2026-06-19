const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const { ownerDashboardController } = require('../controllers/ownerController');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('STORE_OWNER'));

router.get('/dashboard', ownerDashboardController);

module.exports = router;
