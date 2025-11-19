/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if the authenticated user has the required role to access a resource
 */

/**
 * Creates a middleware function that checks if user has one of the allowed roles
 * @param {Array<string>} allowedRoles - Array of role names that are allowed to access the resource
 * @returns {Function} Express middleware function
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    // Check if user object exists (should be set by authenticateToken middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access. User not authenticated.'
      });
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    // User has required role, proceed to next middleware
    next();
  };
}

module.exports = requireRole;
