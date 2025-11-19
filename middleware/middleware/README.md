# Middleware Documentation

This directory contains Express middleware functions for authentication and authorization.

## Files

### auth.middleware.js
JWT authentication middleware that validates tokens and attaches user information to requests.

**Usage:**
```javascript
const authenticateToken = require('./middleware/auth.middleware');

// Protect a route
app.get('/api/protected', authenticateToken, (req, res) => {
  // req.user is now available with USER_ID, username, and role
  res.json({ message: 'Access granted', user: req.user });
});
```

**Token Format:**
- Header: `Authorization: Bearer <token>`
- Token payload must contain: `USER_ID`, `username`, `role`

**Responses:**
- 401: Token missing or invalid
- Proceeds to next middleware if valid

### rbac.middleware.js
Role-Based Access Control middleware that restricts access based on user roles.

**Usage:**
```javascript
const authenticateToken = require('./middleware/auth.middleware');
const requireRole = require('./middleware/rbac.middleware');

// Admin-only route
app.post('/api/admin/action', 
  authenticateToken, 
  requireRole(['Admin']), 
  (req, res) => {
    res.json({ message: 'Admin action performed' });
  }
);

// Multiple roles allowed
app.get('/api/data', 
  authenticateToken, 
  requireRole(['Admin', 'User']), 
  (req, res) => {
    res.json({ data: 'Some data' });
  }
);
```

**Responses:**
- 401: User not authenticated (req.user missing)
- 403: User doesn't have required role
- Proceeds to next middleware if authorized

## Middleware Chain

Always use `authenticateToken` before `requireRole`:

```javascript
app.use('/api/protected', authenticateToken);
app.post('/api/admin', requireRole(['Admin']), adminHandler);
```

Or chain them explicitly:

```javascript
app.post('/api/admin', 
  authenticateToken, 
  requireRole(['Admin']), 
  adminHandler
);
```
