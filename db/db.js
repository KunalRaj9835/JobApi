const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for server operations

let supabase;

function connectToDb() {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Connected to Supabase');
        return supabase;
    } catch (err) {
        console.log('Error connecting to Supabase:', err);
        throw err;
    }
}

function getSupabaseClient() {
    if (!supabase) {
        throw new Error('Supabase client not initialized. Call connectToDb() first.');
    }
    return supabase;
}

module.exports = { connectToDb, getSupabaseClient };