const express = require('express');
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');
const roleRoutes = require('./roleRoutes');
const adminRoutes = require('./adminRoutes');
const storeRoutes = require('./storeRoutes');
const ownerRoutes = require('./ownerRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/roles', roleRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/owner', ownerRoutes);

module.exports = router;
