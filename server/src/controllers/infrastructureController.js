
import pool from '../config/db.js'

const allowedRisks = ['Low', 'Moderate', 'High', 'Critical']

const allowedStatuses = [
  'Operational',
  'Inspection required',
  'Under maintenance',
  'Damaged',
  'Closed',
]

function validateAsset(data = {}) {
  const {
    name,
    type,
    location,
    state,
    district,
    riskLevel,
    status,
    latitude,
    longitude,
  } = data

  const requiredFields = [
    [name, 'Name'],
    [type, 'Type'],
    [location, 'Location'],
    [state, 'State'],
  ]

  for (const [value, field] of requiredFields) {
    if (typeof value !== 'string' || !value.trim()) {
      return `${field} is required`
    }
  }

  if (
    name.length > 150 ||
    type.length > 100 ||
    location.length > 255 ||
    state.length > 100
  ) {
    return 'One or more fields exceed the allowed length'
  }

  if (district != null && typeof district !== 'string') {
    return 'Invalid district'
  }

  if (district && district.length > 120) {
    return 'District is too long'
  }

  if (riskLevel != null && !allowedRisks.includes(riskLevel)) {
    return 'Invalid risk level'
  }

  if (status != null && !allowedStatuses.includes(status)) {
    return 'Invalid infrastructure status'
  }

  const validCoordinate = (value, min, max) =>
    value == null ||
    value === '' ||
    (
      Number.isFinite(Number(value)) &&
      Number(value) >= min &&
      Number(value) <= max
    )

  if (!validCoordinate(latitude, -90, 90)) {
    return 'Invalid latitude'
  }

  if (!validCoordinate(longitude, -180, 180)) {
    return 'Invalid longitude'
  }

  return null
}

// GET all infrastructure assets
export async function getInfrastructure(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM infrastructure_assets
      ORDER BY created_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch infrastructure:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to fetch infrastructure assets',
    })
  }
}

// ADD infrastructure asset
export async function createInfrastructure(request, response) {
  try {
    const validationError = validateAsset(request.body)

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      })
    }

    const {
      name,
      type,
      location,
      district,
      state,
      riskLevel = 'Moderate',
      status = 'Operational',
      latitude,
      longitude,
    } = request.body

    const result = await pool.query(
      `
        INSERT INTO infrastructure_assets
        (
          name, type, location, district, state,
          risk_level, status, latitude, longitude
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        name.trim(),
        type.trim(),
        location.trim(),
        district?.trim() || null,
        state.trim(),
        riskLevel,
        status,
        latitude === '' || latitude == null ? null : Number(latitude),
        longitude === '' || longitude == null ? null : Number(longitude),
      ]
    )

    return response.status(201).json({
      success: true,
      message: 'Infrastructure asset added successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create infrastructure asset:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to add infrastructure asset',
    })
  }
}

// UPDATE infrastructure asset
export async function updateInfrastructure(request, response) {
  try {
    const { id } = request.params

    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return response.status(400).json({
        success: false,
        message: 'Invalid infrastructure ID',
      })
    }

    const validationError = validateAsset(request.body)

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      })
    }

    const {
      name,
      type,
      location,
      district,
      state,
      riskLevel = 'Moderate',
      status = 'Operational',
      latitude,
      longitude,
    } = request.body

    const result = await pool.query(
      `
        UPDATE infrastructure_assets
        SET
          name = $1,
          type = $2,
          location = $3,
          district = $4,
          state = $5,
          risk_level = $6,
          status = $7,
          latitude = $8,
          longitude = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `,
      [
        name.trim(),
        type.trim(),
        location.trim(),
        district?.trim() || null,
        state.trim(),
        riskLevel,
        status,
        latitude === '' || latitude == null ? null : Number(latitude),
        longitude === '' || longitude == null ? null : Number(longitude),
        Number(id),
      ]
    )

    if (!result.rows.length) {
      return response.status(404).json({
        success: false,
        message: 'Infrastructure asset not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Infrastructure asset updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update infrastructure asset:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to update infrastructure asset',
    })
  }
}

// DELETE infrastructure asset
export async function deleteInfrastructure(request, response) {
  try {
    const { id } = request.params

    if (!/^\d+$/.test(id) || Number(id) < 1) {
      return response.status(400).json({
        success: false,
        message: 'Invalid infrastructure ID',
      })
    }

    const result = await pool.query(
      `
        DELETE FROM infrastructure_assets
        WHERE id = $1
        RETURNING id
      `,
      [Number(id)]
    )

    if (!result.rows.length) {
      return response.status(404).json({
        success: false,
        message: 'Infrastructure asset not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Infrastructure asset deleted successfully',
    })
  } catch (error) {
    console.error('Could not delete infrastructure asset:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to delete infrastructure asset',
    })
  }
}
