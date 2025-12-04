// File: lib/adminAuth.js

/**
 * Authentication middleware for admin endpoints
 * Checks for valid Bearer token in Authorization header
 */
export function requireAdmin(handler) {
    return async (req, res) => {
      try {
        // Get token from environment
        const adminToken = process.env.ADMIN_SECRET_TOKEN;
        
        // Check if token is configured
        if (!adminToken) {
          console.error('ADMIN_SECRET_TOKEN not configured in environment');
          return res.status(500).json({ 
            success: false, 
            message: 'Admin authentication not configured' 
          });
        }
        
        // Get auth header
        const authHeader = req.headers.authorization;
        
        // Check if auth header exists
        if (!authHeader) {
          return res.status(401).json({ 
            success: false, 
            message: 'Missing authorization header' 
          });
        }
        
        // Check format: "Bearer TOKEN"
        const [scheme, token] = authHeader.split(' ');
        
        if (scheme !== 'Bearer') {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid authorization scheme. Use: Bearer TOKEN' 
          });
        }
        
        // Verify token
        if (token !== adminToken) {
          // Log failed attempt (for security monitoring)
          console.warn(`Failed admin auth attempt from ${req.socket.remoteAddress || 'unknown'}`);
          
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid authentication token' 
          });
        }
        
        // Token is valid - proceed to handler
        return handler(req, res);
        
      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Authentication error' 
        });
      }
    };
  }
  
  /**
   * Optional: Create a simpler check function for inline use
   */
  export function checkAdminAuth(req) {
    const adminToken = process.env.ADMIN_SECRET_TOKEN;
    const authHeader = req.headers.authorization;
    
    if (!adminToken || !authHeader) return false;
    
    const [scheme, token] = authHeader.split(' ');
    return scheme === 'Bearer' && token === adminToken;
  }