const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET_NAME = 'resumes';

/**
 * Upload Resume - POST /uploadResume
 * Request: email (in body) + resume file
 * Only Applicants can upload resumes
 */
const uploadResume = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, user_type, name')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is an Applicant
    if (userData.user_type !== 'Applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can upload resumes'
      });
    }

    const file = req.file;
    
    // Generate unique filename: email_timestamp.extension
    const fileExtension = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${email.replace('@', '_at_').replace(/\./g, '_')}_${timestamp}.${fileExtension}`;
    const filePath = `${email}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload resume to storage',
        error: uploadError.message
      });
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const resumeUrl = urlData.publicUrl;

    // Update user's resume_url in database
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ 
        resume_url: resumeUrl,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      
      // Rollback: Delete the uploaded file
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return res.status(500).json({
        success: false,
        message: 'Failed to update resume URL in database',
        error: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        name: userData.name,
        email: userData.email,
        resume_url: resumeUrl,
        file_name: fileName,
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get Resume URL - GET /getResume?email=user@example.com
 * Get resume URL by email
 */
const getResume = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const { data, error } = await supabase
      .from('users')
      .select('resume_url, name, email, user_type')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!data.resume_url) {
      return res.status(404).json({
        success: false,
        message: 'No resume uploaded for this user'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: data.name,
        email: data.email,
        user_type: data.user_type,
        resume_url: data.resume_url
      }
    });

  } catch (error) {
    console.error('Get resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Delete Resume - DELETE /deleteResume
 * Delete resume by email
 */
const deleteResume = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Get current resume URL and verify user type
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('resume_url, user_type')
      .eq('email', email)
      .single();

    if (fetchError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userData.user_type !== 'Applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can have resumes'
      });
    }

    if (!userData.resume_url) {
      return res.status(404).json({
        success: false,
        message: 'No resume found to delete'
      });
    }

    // Extract file path from URL
    const resumeUrl = userData.resume_url;
    const urlParts = resumeUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume URL format'
      });
    }
    const filePath = urlParts[1].split('?')[0];

    // Delete from storage
    const { error: deleteStorageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteStorageError) {
      console.error('Storage deletion error:', deleteStorageError);
    }

    // Update database to remove resume_url
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        resume_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update database',
        error: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Delete resume error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  uploadResume,
  getResume,
  deleteResume
};