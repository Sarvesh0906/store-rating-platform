const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');
const {
  listStoresController,
  getStoreController,
  createRatingController,
  updateRatingController,
} = require('../controllers/storeController');

const router = express.Router();

router.use(authenticateUser, authorizeRoles('NORMAL_USER'));

router.get('/', listStoresController);
router.get('/:storeId', getStoreController);
router.post('/:storeId/ratings', createRatingController);
router.put('/:storeId/ratings', updateRatingController);

module.exports = router;
