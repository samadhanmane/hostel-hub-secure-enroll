// Simple authentication middleware for development/testing
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  
  // Check for demo tokens
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Handle demo tokens
    if (token === 'demo-admin-token') {
      req.user = { role: 'admin', email: 'admin@hostelhub.com' };
      return next();
    } else if (token === 'demo-student-token') {
      req.user = { role: 'user', email: 'student@example.com' };
      return next();
    }
  }
  
  // For now, allow admin access for testing (fallback)
  req.user = { role: 'admin', email: 'admin@hostelhub.com' };
  next();
}; 