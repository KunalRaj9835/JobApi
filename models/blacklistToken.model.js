const { getSupabaseClient } = require('../db/db');

class BlacklistTokenModel {
    constructor() {
        this.supabase = getSupabaseClient();
    }

    // Create blacklist token
    async create(tokenData) {
        const { data, error } = await this.supabase
            .from('blacklist_tokens')
            .insert([{
                token: tokenData.token,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Find token
    async findOne(filter) {
        const { data, error } = await this.supabase
            .from('blacklist_tokens')
            .select('*')
            .eq('token', filter.token)
            .gt('expires_at', new Date().toISOString()) // Only get non-expired tokens
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Clean up expired tokens (optional - you can run this periodically)
    async cleanupExpired() {
        const { error } = await this.supabase
            .from('blacklist_tokens')
            .delete()
            .lt('expires_at', new Date().toISOString());

        if (error) throw error;
        return { message: 'Expired tokens cleaned up' };
    }
}

module.exports = new BlacklistTokenModel();