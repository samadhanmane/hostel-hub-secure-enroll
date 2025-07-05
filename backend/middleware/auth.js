const jwt = require('jsonwebtoken');

// Proper JWT authentication middleware
module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  
  console.log('Auth middleware - headers:', req.headers.authorization ? 'Present' : 'Missing');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid authorization header');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.substring(7);
  
  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ message: 'Server configuration error.' });
  }
  
  console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    console.error('Token (first 20 chars):', token.substring(0, 20) + '...');
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('JWT_SECRET length:', process.env.JWT_SECRET?.length);
    return res.status(401).json({ message: 'Invalid token.', details: error.message });
  }
}; 