// File: pages/api/admin/manual-flush.js
import { 
  getAllVerticals, 
  flushVerticalCache,  // ADD THIS - use the one from database.js
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
      const results = [];
      
      // Get all verticals
      const verticals = await getAllVerticals();
      
      for (const vertical of verticals) {
        try {
          const verticalResult = await flushVerticalCache(vertical);
          results.push(verticalResult);
        } catch (error) {
          console.error(`Error flushing cache for vertical ${vertical.name}:`, error);
          results.push({
            vertical: vertical.name,
            success: false,
            error: error.message
          });
        }
      }
  
      const successCount = results.filter(r => r.success).length;
      const totalVerticals = results.length;
      const flushedVerticals = results.filter(r => r.action === 'cache_flushed').length;
  
      // Log the manual flush execution
      await logConversion({
        clickid: 'admin-manual',
        action: 'manual_cache_flush',
        message: `Manual cache flush executed by admin. ${successCount}/${totalVerticals} verticals processed successfully. ${flushedVerticals} had cache to flush. Eastern Time: ${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}`
      });
  
      return res.status(200).json({
        success: true,
        message: `Manual flush completed for ${successCount}/${totalVerticals} verticals`,
        flushed_verticals: flushedVerticals,
        results: results,
        timestamp: new Date().toISOString(),
        eastern_time: new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
      });
  
    } catch (error) {
      console.error('Manual flush error:', error);
      
      await logConversion({
        clickid: 'admin-manual',
        action: 'manual_cache_flush_error',
        message: `Manual cache flush failed: ${error.message}`
      });
  
      return res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });