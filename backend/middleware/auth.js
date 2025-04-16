const db = require('../webmeta.js'); // Make sure to require your database

async function requireAuth(req, res, next) {
   
  
    if (!req.session.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No active session found. Please log in.'
      });
    }
  
    try {
      const user = db.prepare('SELECT uuid, is_active FROM users WHERE uuid = ?').get(req.session.user.uuid);
  
      if (!user) {
        req.session.destroy(); 
        return res.status(401).json({ 
          error: 'Invalid Session', 
          message: 'User account no longer exists.'
        });
      }
  
      if (!user.is_active) {
        req.session.destroy(); 
        return res.status(403).json({ 
          error: 'Account Disabled', 
          message: 'Your account has been deactivated.'
        });
      }
  
      req.user = { uuid: req.session.user.uuid, username: req.session.user.username };
      next();
    } catch (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({ 
        error: 'Authentication Error',
        message: 'Failed to verify user session.'
      });
    }
  }
  

module.exports = requireAuth;
