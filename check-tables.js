const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTables() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    console.log('Checking available tables...');
    
    // Try to check what tables exist by testing common ones
    const tables = ['users', 'partners', 'blacklist_tokens', 'comments'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}' - Error:`, error.code, error.message);
        } else {
          console.log(`✅ Table '${table}' exists - Count:`, count);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - Exception:`, err.message);
      }
    }
    
  } catch (err) {
    console.log('❌ General error:', err.message);
  }
}

checkTables();