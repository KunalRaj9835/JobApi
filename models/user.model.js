const jwt = require('jsonwebtoken');
const { getSupabaseClient } = require('../db/db');
const bcrypt = require('bcrypt');

class UserModel {
    constructor() {
        this.supabase = getSupabaseClient();
    }

    // Create a new user (Applicant or Admin)
    async create(userData) {
        const { data, error } = await this.supabase
            .from('users')
            .insert([{
                name: userData.name,
                email: userData.email,
                password_hash: userData.password_hash, // already hashed!
                user_type: userData.user_type, // 'Admin' or 'Applicant'
                profile_headline: userData.profile_headline,
                address: userData.address,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Find user by ID
    async findById(id) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Find user by email
    async findByEmail(email) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Update user
    async findByIdAndUpdate(id, updateData) {
        const { data, error } = await this.supabase
            .from('users')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Delete user
    async findByIdAndDelete(id) {
        const { data, error } = await this.supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Generate auth token
    generateAuthToken(userId, userType) {
        return jwt.sign(
            { _id: userId, userType: userType }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
    }

    // Compare password
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Hash password
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // Helper methods for user type checking
    isAdmin(user) {
        return user.user_type === 'Admin';
    }

    isApplicant(user) {
        return user.user_type === 'Applicant';
    }
}

module.exports = new UserModel();