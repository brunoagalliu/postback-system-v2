// File: pages/api/cron/flush-cache.js
import { 
  getAllVerticals, 
  flushVerticalCache,  // ADD THIS - import from database.js
  logConversion
} from '../../../lib/database.js';

export default async function handler(req, res) {
// Vercel cron jobs are authenticated automatically
// Only allow from Vercel cron
if (req.headers['user-agent'] !== 'vercel-cron/1.0') {
  return res.status(401).json({ error: 'Unauthorized' });
}

try {
  const results = [];
  
  // Get all verticals
  const verticals = await getAllVerticals();
  
  for (const vertical of verticals) {
    try {
      // Use the imported function from database.js
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

  // Log the cron job execution
  await logConversion({
    clickid: 'vercel-cron',
    action: 'daily_cache_flush',
    message: `Daily cache flush completed via Vercel cron. ${successCount}/${totalVerticals} verticals processed successfully. Eastern Time: ${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}`
  });

  return res.status(200).json({
    success: true,
    message: `Cache flush completed for ${successCount}/${totalVerticals} verticals`,
    results: results,
    timestamp: new Date().toISOString(),
    eastern_time: new Date().toLocaleString("en-US", {timeZone: "America/New_York"})
  });

} catch (error) {
  console.error('Vercel cron job error:', error);
  
  await logConversion({
    clickid: 'vercel-cron',
    action: 'daily_cache_flush_error',
    message: `Daily cache flush failed via Vercel cron: ${error.message}`
  });

  return res.status(500).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
}
}