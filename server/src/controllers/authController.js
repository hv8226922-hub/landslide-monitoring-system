
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return (
    typeof email === 'string' &&
    email.length <= 254 &&
    emailRegex.test(email)
  )
}

// CITIZEN REGISTRATION
export async function register(request, response) {
  try {
    const { name, email, password } = request.body

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return response.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
    }

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName || normalizedName.length > 100) {
      return response.status(400).json({
        success: false,
        message: 'Name must be between 1 and 100 characters',
      })
    }

    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
    }

    if ([...password].length < 8) {
      return response.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters',
      })
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      return response.status(400).json({
        success: false,
        message: 'Password must not exceed 72 bytes',
      })
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    )

    if (existingUser.rows.length > 0) {
      return response.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [normalizedName, normalizedEmail, passwordHash, 'citizen']
    )

    return response.status(201).json({
      success: true,
      message: 'Citizen registered successfully',
      user: result.rows[0],
    })
  } catch (error) {
    if (error.code === '23505') {
      return response.status(409).json({
        success: false,
        message: 'Email already registered',
      })
    }

    console.error('Registration error:', error)

    return response.status(500).json({
      success: false,
      message: 'Registration failed',
    })
  }
}

// USER LOGIN
export async function login(request, response) {
  try {
    const { email, password, role } = request.body

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof role !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return response.status(400).json({
        success: false,
        message: 'Email, password and role are required',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!isValidEmail(normalizedEmail)) {
      return response.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
  return response.status(400).json({
    success: false,
    message: 'Invalid email or password',
  })
}

    if (!['admin', 'officer', 'citizen'].includes(role)) {
      return response.status(400).json({
        success: false,
        message: 'Invalid role',
      })
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    )

    const user = result.rows[0]

    if (!user || user.role !== role) {
      return response.status(401).json({
        success: false,
        message: 'Invalid email, password or role',
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordMatch) {
      return response.status(401).json({
        success: false,
        message: 'Invalid email, password or role',
      })
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured')

      return response.status(500).json({
        success: false,
        message: 'Authentication service is not configured',
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    )

    return response.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    return response.status(500).json({
      success: false,
      message: 'Login failed',
    })
  }
}

// GET ALL OFFICERS (Admin use)
export async function getOfficers(request, response) {
  try {
    const result = await pool.query(`
      SELECT id, name, email
      FROM users
      WHERE role = 'officer'
      ORDER BY name ASC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch officers:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch officers',
    })
  }
}
