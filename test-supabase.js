const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Testing Supabase Connection...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);

if (process.env.SUPABASE_SERVICE_KEY) {
  console.log('First 20 chars of key:', process.env.SUPABASE_SERVICE_KEY.substring(0, 20) + '...');
}

async function testConnection() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    console.log('✅ Client created successfully');
    
    // Test a simple query
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Test query failed:', error);
    } else {
      console.log('✅ Test query successful, user count:', count);
    }
    
    // Test if we can access the users table schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (schemaError) {
      console.log('❌ Schema test failed:', schemaError);
    } else {
      console.log('✅ Schema test successful');
    }
    
  } catch (err) {
    console.log('❌ Connection test failed:', err.message);
    console.log('Full error:', err);
  }
}

testConnection();