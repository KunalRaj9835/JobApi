const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { uploadResume, getResume, deleteResume } = require('../controllers/resumeController');

// Upload resume (provide email in body + file)
router.post('/upload', upload.single('resume'), uploadResume);

// Get resume URL by email
router.get('/getResume', getResume);

// Delete resume by email
router.delete('/deleteResume', deleteResume);

module.exports = router;
