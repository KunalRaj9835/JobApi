const { getSupabaseClient } = require('../db/db');

class PartnerModel {
    constructor() {
        this.supabase = getSupabaseClient();
    }

    // Find partner by ID
    async findById(id) {
        const { data, error } = await this.supabase
            .from('partners')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Find all partners
    async find(filters = {}) {
        let query = this.supabase.from('partners').select('*');

        // Apply filters if provided
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined) {
                query = query.eq(key, filters[key]);
            }
        });

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // Create partner
    async create(partnerData) {
        const { data, error } = await this.supabase
            .from('partners')
            .insert([partnerData])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Update partner
    async findByIdAndUpdate(id, updateData) {
        const { data, error } = await this.supabase
            .from('partners')
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

    // Delete partner
    async findByIdAndDelete(id) {
        const { data, error } = await this.supabase
            .from('partners')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new PartnerModel();