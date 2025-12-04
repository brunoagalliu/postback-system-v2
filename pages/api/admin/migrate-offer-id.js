// File: pages/api/admin/migrate-offer-id.js
import { getPool } from '../../../lib/database.js';
import { requireAdmin } from '../../../lib/adminAuth.js';

export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  const connection = await getPool().getConnection();
  
  try {
    console.log('Starting offer_id migration...');

    // Check if offer_id already exists in cached_conversions
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM cached_conversions LIKE 'offer_id'
    `);

    if (columns.length === 0) {
      console.log('Adding offer_id to cached_conversions...');
      await connection.execute(`
        ALTER TABLE cached_conversions 
        ADD COLUMN offer_id VARCHAR(255) NOT NULL DEFAULT '' AFTER clickid,
        ADD INDEX idx_offer_id (offer_id),
        ADD INDEX idx_offer_clickid (offer_id, clickid)
      `);
    } else {
      console.log('offer_id already exists in cached_conversions');
    }

    // Check and add to conversion_logs
    const [logColumns] = await connection.execute(`
      SHOW COLUMNS FROM conversion_logs LIKE 'offer_id'
    `);

    if (logColumns.length === 0) {
      console.log('Adding offer_id to conversion_logs...');
      await connection.execute(`
        ALTER TABLE conversion_logs 
        ADD COLUMN offer_id VARCHAR(255) DEFAULT NULL AFTER clickid,
        ADD INDEX idx_offer_id (offer_id)
      `);
    } else {
      console.log('offer_id already exists in conversion_logs');
    }

    // Check and add to postback_history
    const [postbackColumns] = await connection.execute(`
      SHOW COLUMNS FROM postback_history LIKE 'offer_id'
    `);

    if (postbackColumns.length === 0) {
      console.log('Adding offer_id to postback_history...');
      await connection.execute(`
        ALTER TABLE postback_history 
        ADD COLUMN offer_id VARCHAR(255) NOT NULL DEFAULT '' AFTER clickid,
        ADD INDEX idx_offer_id (offer_id)
      `);
    } else {
      console.log('offer_id already exists in postback_history');
    }

    console.log('Successfully completed offer_id migration');
    
    return res.status(200).json({
      success: true,
      message: 'Database migration completed - offer_id columns added/verified in all tables'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      sqlMessage: error.sqlMessage,
      message: 'Failed to migrate database'
    });
  } finally {
    connection.release();
  }
});