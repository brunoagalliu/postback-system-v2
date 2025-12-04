// File: pages/api/admin/migrate-param1.js
import { getPool } from '../../../lib/database.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  const connection = await getPool().getConnection();
  
  try {
    // Add param1 to cached_conversions
    await connection.execute(`
      ALTER TABLE cached_conversions 
      ADD COLUMN IF NOT EXISTS param1 DECIMAL(10,2) DEFAULT 0 AFTER amount
    `);

    // Add param1 to conversion_logs
    await connection.execute(`
      ALTER TABLE conversion_logs 
      ADD COLUMN IF NOT EXISTS original_param1 DECIMAL(10,2) DEFAULT NULL AFTER original_amount,
      ADD COLUMN IF NOT EXISTS trigger_param1 DECIMAL(10,2) DEFAULT NULL AFTER total_sent
    `);

    // Add param1 to postback_history
    await connection.execute(`
      ALTER TABLE postback_history 
      ADD COLUMN IF NOT EXISTS param1 DECIMAL(10,2) DEFAULT 0 AFTER amount
    `);

    console.log('Successfully added param1 columns to all tables');
    
    return res.status(200).json({
      success: true,
      message: 'Database migration completed - param1 columns added to all tables'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to migrate database'
    });
  } finally {
    connection.release();
  }
}