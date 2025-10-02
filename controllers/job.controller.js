const JobModel = require('../models/job.model');
const UserModel = require('../models/user.model');

class JobController {
    // POST /job - Create a new job
    async createJob(req, res) {
        try {
            const { title, description, companyName, email } = req.body;

            // Validation
            if (!title || !description || !companyName || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required (title, description, companyName, email)'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Check if user exists with this email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User with this email does not exist'
                });
            }

            // Create job
            const jobData = {
                title,
                description,
                company_name: companyName,
                posted_by_email: email
            };

            const newJob = await JobModel.create(jobData);

            // Format response
            const jobResponse = {
                id: newJob.id,
                title: newJob.title,
                description: newJob.description,
                companyName: newJob.company_name,
                postedOn: newJob.posted_on,
                postedBy: newJob.posted_by_email
            };

            return res.status(201).json({
                success: true,
                message: 'Job created successfully',
                data: jobResponse
            });

        } catch (error) {
            console.error('Create job error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while creating job',
                error: error.message
            });
        }
    }

    // GET /job/:id - View a specific job with applicants
    async getJob(req, res) {
        try {
            const { id } = req.params;

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID format'
                });
            }

            // Get job details
            const job = await JobModel.findById(id);
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            // Get applicants for this job
            const applicants = await JobModel.getJobApplicants(id);

            // Format response
            const jobResponse = {
                id: job.id,
                title: job.title,
                description: job.description,
                companyName: job.company_name,
                postedOn: job.posted_on,
                postedBy: job.posted_by_email,
                applicants: applicants.map(app => ({
                    id: app.id,
                    name: app.name,
                    email: app.email,
                    profileHeadline: app.profile_headline,
                    address: app.address,
                    resumeUrl: app.resume_url,
                    appliedAt: app.applied_at,
                    status: app.status
                }))
            };

            return res.status(200).json({
                success: true,
                message: 'Job details retrieved successfully',
                data: jobResponse
            });

        } catch (error) {
            console.error('Get job error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving job',
                error: error.message
            });
        }
    }

    // GET /jobs - Get all jobs
    async getAllJobs(req, res) {
        try {
            const { limit = 50, offset = 0 } = req.query;

            const jobs = await JobModel.findAll(parseInt(limit), parseInt(offset));

            const jobsResponse = jobs.map(job => ({
                id: job.id,
                title: job.title,
                description: job.description,
                companyName: job.company_name,
                postedOn: job.posted_on,
                postedBy: job.posted_by_email
            }));

            return res.status(200).json({
                success: true,
                message: 'Jobs retrieved successfully',
                data: jobsResponse,
                count: jobsResponse.length
            });

        } catch (error) {
            console.error('Get all jobs error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving jobs',
                error: error.message
            });
        }
    }

    // GET /applicants - Get all applicants
    async getAllApplicants(req, res) {
        try {
            const applicants = await JobModel.getAllApplicants();

            const applicantsResponse = applicants.map(app => ({
                id: app.id,
                name: app.name,
                email: app.email,
                profileHeadline: app.profile_headline,
                address: app.address,
                resumeUrl: app.resume_url,
                createdAt: app.created_at
            }));

            return res.status(200).json({
                success: true,
                message: 'Applicants retrieved successfully',
                data: applicantsResponse,
                count: applicantsResponse.length
            });

        } catch (error) {
            console.error('Get applicants error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving applicants',
                error: error.message
            });
        }
    }

    // GET /applicant/:id - Get specific applicant details
    async getApplicant(req, res) {
        try {
            const { id } = req.params;

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid applicant ID format'
                });
            }

            const applicant = await JobModel.getApplicantById(id);
            if (!applicant) {
                return res.status(404).json({
                    success: false,
                    message: 'Applicant not found'
                });
            }

            const applicantResponse = {
                id: applicant.id,
                name: applicant.name,
                email: applicant.email,
                profileHeadline: applicant.profile_headline,
                address: applicant.address,
                resumeUrl: applicant.resume_url,
                createdAt: applicant.created_at,
                updatedAt: applicant.updated_at
            };

            return res.status(200).json({
                success: true,
                message: 'Applicant details retrieved successfully',
                data: applicantResponse
            });

        } catch (error) {
            console.error('Get applicant error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while retrieving applicant',
                error: error.message
            });
        }
    }

    // POST /job/:id/apply - Apply to a job
    async applyToJob(req, res) {
        try {
            const { id } = req.params;
            const { email } = req.body;

            // Validation
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID format'
                });
            }

            // Check if job exists
            const job = await JobModel.findById(id);
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            // Check if user exists and is an applicant
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.user_type !== 'Applicant') {
                return res.status(403).json({
                    success: false,
                    message: 'Only applicants can apply to jobs'
                });
            }

            // Check if already applied
            const hasApplied = await JobModel.hasApplied(id, email);
            if (hasApplied) {
                return res.status(409).json({
                    success: false,
                    message: 'You have already applied to this job'
                });
            }

            // Apply to job
            const application = await JobModel.applyToJob(id, email);

            return res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: {
                    applicationId: application.id,
                    jobId: application.job_id,
                    applicantEmail: application.applicant_email,
                    appliedAt: application.applied_at,
                    status: application.status
                }
            });

        } catch (error) {
            console.error('Apply to job error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error while applying to job',
                error: error.message
            });
        }
    }
}

module.exports = new JobController();