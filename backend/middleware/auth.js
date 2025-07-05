const jwt = require('jsonwebtoken');

// Proper JWT authentication middleware
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.substring(7);
  
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ message: 'Server configuration error.' });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    console.error('Token:', token.substring(0, 20) + '...');
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    return res.status(401).json({ message: 'Invalid token.' });
  }
}; 