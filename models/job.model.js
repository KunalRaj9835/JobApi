const { getSupabaseClient } = require('../db/db');

class JobModel {
    // Create a new job
    static async create(jobData) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                title: jobData.title,
                description: jobData.description,
                company_name: jobData.company_name,
                posted_by_email: jobData.posted_by_email,
                posted_on: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Find job by ID
    static async findById(jobId) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Get all jobs
    static async findAll(limit = 50, offset = 0) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('posted_on', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];
    }

    // Get jobs by email
    static async findByEmail(email) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('posted_by_email', email)
            .order('posted_on', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Get applicants for a specific job
    static async getJobApplicants(jobId) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('job_applications')
            .select(`
                applied_at,
                status,
                users (
                    id,
                    name,
                    email,
                    profile_headline,
                    address,
                    resume_url
                )
            `)
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false });

        if (error) throw error;
        
        // Transform the data to match the expected format
        return data?.map(app => ({
            id: app.users.id,
            name: app.users.name,
            email: app.users.email,
            profile_headline: app.users.profile_headline,
            address: app.users.address,
            resume_url: app.users.resume_url,
            applied_at: app.applied_at,
            status: app.status
        })) || [];
    }

    // Apply to a job
    static async applyToJob(jobId, applicantEmail) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('job_applications')
            .insert([{
                job_id: jobId,
                applicant_email: applicantEmail,
                applied_at: new Date().toISOString(),
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Check if user has already applied
    static async hasApplied(jobId, applicantEmail) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('job_applications')
            .select('id')
            .eq('job_id', jobId)
            .eq('applicant_email', applicantEmail)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }

    // Get all applicants (users with userType = 'Applicant')
    static async getAllApplicants() {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, profile_headline, address, resume_url, created_at')
            .eq('user_type', 'Applicant')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Get applicant details by ID
    static async getApplicantById(applicantId) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, user_type, profile_headline, address, resume_url, created_at, updated_at')
            .eq('id', applicantId)
            .eq('user_type', 'Applicant')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Delete a job
    static async delete(jobId) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', jobId)
            .select('id')
            .single();

        if (error) throw error;
        return data;
    }

    // Update a job
    static async update(jobId, updateData) {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('jobs')
            .update({
                title: updateData.title,
                description: updateData.description,
                company_name: updateData.company_name,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = JobModel;