const express = require('express');
const { createProject, getProjects, getProjectById, updateProjectStatus, generateInvoice, getDashboardStats } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createProject).get(protect, getProjects);
router.route('/dashboard').get(protect, getDashboardStats);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/status').put(protect, updateProjectStatus);
router.route('/:id/invoice').post(protect, generateInvoice);

module.exports = router;
