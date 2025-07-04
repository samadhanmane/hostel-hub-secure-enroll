// Simple authentication middleware for development/testing
module.exports = function (req, res, next) {
  // For now, always attach an admin user for testing
  req.user = { role: 'admin', email: 'admin@hostelhub.com' };
  next();
}; 