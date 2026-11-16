
import pool from '../config/db.js'

const allowedStatuses = ['Open', 'Blocked', 'Restricted']
const allowedRisks = ['Low', 'Moderate', 'High', 'Critical']

function validateVillage(data = {}) {
  const {
    name,
    district,
    state,
    population,
    latitude,
    longitude,
    roadStatus,
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
    population !== undefined &&
    population !== null &&
    population !== '' &&
    (
      !Number.isInteger(Number(population)) ||
      Number(population) < 0
    )
  ) {
    return 'Invalid population'
  }

  if (!allowedStatuses.includes(roadStatus || 'Open')) {
    return 'Invalid road status'
  }

  if (!allowedRisks.includes(riskLevel || 'Moderate')) {
    return 'Invalid risk level'
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

// Get all villages
export async function getVillages(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM villages
      ORDER BY created_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch villages:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch villages',
    })
  }
}

// Create village
export async function createVillage(request, response) {
  const errorMessage = validateVillage(request.body)

  if (errorMessage) {
    return response.status(400).json({
      success: false,
      message: errorMessage,
    })
  }

  const {
    name,
    district,
    state,
    population = null,
    latitude = null,
    longitude = null,
    roadStatus = 'Open',
    riskLevel = 'Moderate',
  } = request.body

  try {
    const result = await pool.query(
      `
        INSERT INTO villages (
          name, district, state, population,
          latitude, longitude, road_status, risk_level
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        name.trim(),
        district.trim(),
        state.trim(),
        population == null || population === '' ? null : Number(population),
        latitude == null || latitude === '' ? null : Number(latitude),
        longitude == null || longitude === '' ? null : Number(longitude),
        roadStatus,
        riskLevel,
      ]
    )

    return response.status(201).json({
      success: true,
      message: 'Village added successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create village:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not add village',
    })
  }
}

// Update village
export async function updateVillage(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid village ID',
    })
  }

  const errorMessage = validateVillage(request.body)

  if (errorMessage) {
    return response.status(400).json({
      success: false,
      message: errorMessage,
    })
  }

  const {
    name,
    district,
    state,
    population = null,
    latitude = null,
    longitude = null,
    roadStatus = 'Open',
    riskLevel = 'Moderate',
  } = request.body

  try {
    const result = await pool.query(
      `
        UPDATE villages
        SET name = $1,
            district = $2,
            state = $3,
            population = $4,
            latitude = $5,
            longitude = $6,
            road_status = $7,
            risk_level = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `,
      [
        name.trim(),
        district.trim(),
        state.trim(),
        population == null || population === '' ? null : Number(population),
        latitude == null || latitude === '' ? null : Number(latitude),
        longitude == null || longitude === '' ? null : Number(longitude),
        roadStatus,
        riskLevel,
        Number(id),
      ]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Village not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Village updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update village:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not update village',
    })
  }
}

// Delete village
export async function deleteVillage(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid village ID',
    })
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM villages
        WHERE id = $1
        RETURNING *
      `,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Village not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Village deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete village:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not delete village',
    })
  }
}
