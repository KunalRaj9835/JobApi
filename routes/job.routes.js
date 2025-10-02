const express = require('express');
const router = express.Router();
const JobController = require('../controllers/job.controller');

// Job Management Routes
router.post('/job', JobController.createJob.bind(JobController));
router.get('/job/:id', JobController.getJob.bind(JobController));
router.get('/jobs', JobController.getAllJobs.bind(JobController));

// Apply to job
router.post('/job/:id/apply', JobController.applyToJob.bind(JobController));

// Applicant Routes
router.get('/applicants', JobController.getAllApplicants.bind(JobController));
router.get('/applicant/:id', JobController.getApplicant.bind(JobController));

module.exports = router;