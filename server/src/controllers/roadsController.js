
import pool from '../config/db.js'

const allowedStatuses = ['Open', 'Blocked', 'Restricted']
const allowedRisks = ['Low', 'Moderate', 'High', 'Critical']

function validateRoad(data = {}) {
  const {
    name,
    district,
    state,
    latitude,
    longitude,
    status,
    riskLevel,
  } = data

  if (
    typeof name !== 'string' || !name.trim() ||
    typeof district !== 'string' || !district.trim() ||
    typeof state !== 'string' || !state.trim()
  ) {
    return 'Name, district and state are required'
  }

  if (
    name.length > 150 ||
    district.length > 120 ||
    state.length > 100
  ) {
    return 'One or more fields exceed the allowed length'
  }

  if (
    !allowedStatuses.includes(status) ||
    !allowedRisks.includes(riskLevel)
  ) {
    return 'Invalid road status or risk level'
  }

  const validCoordinate = (value, min, max) =>
    value == null ||
    value === '' ||
    (
      Number.isFinite(Number(value)) &&
      Number(value) >= min &&
      Number(value) <= max
    )

  if (
    !validCoordinate(latitude, -90, 90) ||
    !validCoordinate(longitude, -180, 180)
  ) {
    return 'Invalid coordinates'
  }

  return null
}

// Get all roads
export async function getRoads(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM roads
      ORDER BY created_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch roads:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch roads',
    })
  }
}

// Add a new road
export async function createRoad(request, response) {
  const {
    name,
    district,
    state,
    latitude = null,
    longitude = null,
    status = 'Open',
    riskLevel = 'Moderate',
  } = request.body

  const validationError = validateRoad({
    name,
    district,
    state,
    latitude,
    longitude,
    status,
    riskLevel,
  })

  if (validationError) {
    return response.status(400).json({
      success: false,
      message: validationError,
    })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO roads (
          name, district, state,
          latitude, longitude, status, risk_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        name.trim(),
        district.trim(),
        state.trim(),
        latitude === '' || latitude == null ? null : Number(latitude),
        longitude === '' || longitude == null ? null : Number(longitude),
        status,
        riskLevel,
      ]
    )

    return response.status(201).json({
      success: true,
      message: 'Road added successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create road:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not add road',
    })
  }
}

// Update a road
export async function updateRoad(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid road ID',
    })
  }

  const {
    name,
    district,
    state,
    latitude = null,
    longitude = null,
    status,
    riskLevel,
  } = request.body

  const validationError = validateRoad({
    name,
    district,
    state,
    latitude,
    longitude,
    status,
    riskLevel,
  })

  if (validationError) {
    return response.status(400).json({
      success: false,
      message: validationError,
    })
  }

  try {
    const result = await pool.query(
      `
        UPDATE roads
        SET name = $1,
            district = $2,
            state = $3,
            latitude = $4,
            longitude = $5,
            status = $6,
            risk_level = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `,
      [
        name.trim(),
        district.trim(),
        state.trim(),
        latitude === '' || latitude == null ? null : Number(latitude),
        longitude === '' || longitude == null ? null : Number(longitude),
        status,
        riskLevel,
        Number(id),
      ]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Road not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Road updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update road:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not update road',
    })
  }
}

// Delete a road
export async function deleteRoad(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid road ID',
    })
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM roads
        WHERE id = $1
        RETURNING *
      `,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Road not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Road deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete road:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not delete road',
    })
  }
}
