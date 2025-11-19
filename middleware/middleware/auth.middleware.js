const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches user to request
 */
function authenticateToken(req, res, next) {
  // Extract token from Authorization header (Bearer scheme)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  // Return 401 if token is missing
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access. Token is required.'
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.'
      });
    }

    // Attach decoded user object to request
    // Expected payload: { USER_ID, username, role }
    req.user = {
      USER_ID: decoded.USER_ID,
      username: decoded.username,
      role: decoded.role
    };

    // Token is valid, proceed to next middleware
    next();
  });
}

module.exports = authenticateToken;
