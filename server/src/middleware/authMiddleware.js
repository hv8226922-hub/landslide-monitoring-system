
import jwt from 'jsonwebtoken'

// AUTHENTICATE TOKEN
export function authenticateToken(request, response, next) {
  const authHeader = request.headers.authorization

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null

  if (!token) {
    return response.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.',
    })
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured')

    return response.status(500).json({
      success: false,
      message: 'Authentication service is not configured',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (
      !decoded.id ||
      !['admin', 'officer', 'citizen'].includes(decoded.role)
    ) {
      return response.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      })
    }

    request.user = {
      id: decoded.id,
      role: decoded.role,
    }

    next()
  } catch (error) {
    return response.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
    })
  }
}

// AUTHORIZE USER ROLES
export function authorizeRoles(...allowedRoles) {
  return (request, response, next) => {
    if (
      !request.user ||
      !allowedRoles.includes(request.user.role)
    ) {
      return response.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.',
      })
    }

    next()
  }
}
