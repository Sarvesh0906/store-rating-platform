const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  dashboardController,
  createUserController,
  createStoreController,
  listUsersController,
  listStoresController,
  userDetailController,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('SYSTEM_ADMIN'));

router.get('/dashboard', dashboardController);
router.post('/users', createUserController);
router.post('/stores', createStoreController);
router.get('/users', listUsersController);
router.get('/stores', listStoresController);
router.get('/users/:id', userDetailController);

module.exports = router;
