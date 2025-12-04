// File: pages/api/admin/init-database.js
import { initializeDatabase, initializeSimpleOffersTable } from '../../../lib/database.js';

import { requireAdmin } from '../../../lib/adminAuth.js';

export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('Initializing main database tables...');
    await initializeDatabase();
    console.log('✅ Main tables initialized');
    
    console.log('Initializing offers table...');
    await initializeSimpleOffersTable();
    console.log('✅ Offers table initialized');
    
    return res.status(200).json({
      success: true,
      message: 'Database initialization completed successfully',
      tables_created: [
        'cached_conversions',
        'conversion_logs',
        'postback_history',
        'verticals',
        'offer_verticals',
        'offers'
      ]
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to initialize database'
    });
  }
});