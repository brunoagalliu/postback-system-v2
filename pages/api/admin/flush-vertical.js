// File: pages/api/admin/flush-vertical.js
import { 
  getPool, 
  flushVerticalCache,  // ADD THIS - import from database.js
  logConversion
} from '../../../lib/database.js';
import { requireAdmin } from '../../../lib/adminAuth.js';

export default requireAdmin(async function handler(req, res) {
if (req.method !== 'POST') {
  return res.status(405).json({ 
    success: false,
    message: 'Method not allowed' 
  });
}

try {
  const { vertical_id } = req.body;
  
  if (!vertical_id) {
    return res.status(400).json({
      success: false,
      message: 'vertical_id is required'
    });
  }

  // Get vertical info first
  const connection = await getPool().getConnection();
  
  try {
    const [verticalInfo] = await connection.execute(`
      SELECT * FROM verticals WHERE id = ?
    `, [vertical_id]);

    if (verticalInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vertical not found'
      });
    }

    const vertical = verticalInfo[0];
    
    // Use the imported function from database.js
    const result = await flushVerticalCache(vertical);

    // Log the manual flush execution for this specific vertical
    await logConversion({
      clickid: 'admin-manual',
      action: 'manual_vertical_flush',
      message: `Manual flush executed by admin for vertical "${vertical.name}". Result: ${result.message}. Eastern Time: ${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}`
    });

    return res.status(200).json({
      success: true,
      vertical: vertical.name,
      result: result,
      timestamp: new Date().toISOString(),
      eastern_time: new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
    });

  } finally {
    connection.release();
  }

} catch (error) {
  console.error('Single vertical flush error:', error);
  
  await logConversion({
    clickid: 'admin-manual',
    action: 'manual_vertical_flush_error',
    message: `Manual vertical flush failed: ${error.message}`
  });

  return res.status(500).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
}
});