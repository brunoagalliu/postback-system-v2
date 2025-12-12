// File: pages/api/admin/migrate-advanced-mode.js
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
    console.log('Starting advanced mode migration...');

    // Add mode column
    await connection.execute(`
      ALTER TABLE offers 
      ADD COLUMN IF NOT EXISTS mode ENUM('simple', 'advanced') DEFAULT 'simple' AFTER offer_name
    `);

    // Add trigger_amount column
    await connection.execute(`
      ALTER TABLE offers 
      ADD COLUMN IF NOT EXISTS trigger_amount DECIMAL(10,2) DEFAULT NULL AFTER mode
    `);

    // Add low_event_type column
    await connection.execute(`
      ALTER TABLE offers 
      ADD COLUMN IF NOT EXISTS low_event_type VARCHAR(100) DEFAULT NULL AFTER trigger_amount
    `);

    // Add high_event_type column
    await connection.execute(`
      ALTER TABLE offers 
      ADD COLUMN IF NOT EXISTS high_event_type VARCHAR(100) DEFAULT NULL AFTER low_event_type
    `);

    console.log('Successfully added advanced mode columns to offers table');
    
    return res.status(200).json({
      success: true,
      message: 'Advanced mode migration completed - columns added to offers table'
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
});