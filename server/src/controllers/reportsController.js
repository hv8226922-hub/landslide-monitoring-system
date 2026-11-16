
import pool from '../config/db.js'

// Get all reports (Admin and Officer)
export async function getReports(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM reports
      ORDER BY created_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch reports:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch reports',
    })
  }
}

// Get a single report by ID
export async function getReportById(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid report ID',
    })
  }

  try {
    const result = await pool.query(
      `SELECT * FROM reports WHERE id = $1`,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    return response.status(200).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not fetch report:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch report',
    })
  }
}

// Get reports submitted by logged-in user
export async function getMyReports(request, response) {
  try {
    const result = await pool.query(
      `
        SELECT *
        FROM reports
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [request.user.id]
    )

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch user reports:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch your reports',
    })
  }
}

// Create new report and automatically generate an alert
export async function createReport(request, response) {
  const {
    reporterName,
    location,
    latitude,
    longitude,
    incidentType = 'Other',
    severity = 'Moderate',
    description,
    photoUrl = null,
  } = request.body || {}

  const validCoordinate = (value, min, max) =>
    value == null ||
    value === '' ||
    (
      Number.isFinite(Number(value)) &&
      Number(value) >= min &&
      Number(value) <= max
    )

  if (
    typeof location !== 'string' ||
    !location.trim() ||
    location.length > 255 ||
    typeof description !== 'string' ||
    !description.trim() ||
    description.length > 5000
  ) {
    return response.status(400).json({
      success: false,
      message: 'Location and description are required',
    })
  }

  if (
    typeof incidentType !== 'string' ||
    !incidentType.trim() ||
    incidentType.length > 100 ||
    typeof severity !== 'string' ||
    !['Low', 'Moderate', 'High', 'Critical'].includes(severity)
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid incident type or severity',
    })
  }

  if (
    reporterName != null &&
    (
      typeof reporterName !== 'string' ||
      reporterName.length > 120
    )
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid reporter name',
    })
  }

  if (
    photoUrl != null &&
    (
      typeof photoUrl !== 'string' ||
      photoUrl.length > 2048
    )
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid photo URL',
    })
  }

  if (
    !validCoordinate(latitude, -90, 90) ||
    !validCoordinate(longitude, -180, 180)
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid coordinates',
    })
  }

  let client

  try {
    client = await pool.connect()

    await client.query('BEGIN')

    const reportResult = await client.query(
      `
        INSERT INTO reports (
          user_id,
          reporter_name,
          location,
          latitude,
          longitude,
          incident_type,
          severity,
          description,
          photo_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        request.user.id,
        reporterName?.trim() || 'Anonymous citizen',
        location.trim(),
        latitude === '' || latitude == null ? null : Number(latitude),
        longitude === '' || longitude == null ? null : Number(longitude),
        incidentType.trim(),
        severity,
        description.trim(),
        photoUrl,
      ]
    )

    const report = reportResult.rows[0]

    await client.query(
      `
        INSERT INTO alerts (
          title,
          district,
          risk_level,
          message
        )
        VALUES ($1, $2, $3, $4)
      `,
      [
        `New ${severity} severity report received`,
        location.trim(),
        severity,
        `A new ${incidentType.trim()} report was submitted by ${reporterName?.trim() || 'Anonymous citizen'}. Description: ${description.trim()}`,
      ]
    )

    await client.query('COMMIT')

    return response.status(201).json({
      success: true,
      message: 'Report submitted successfully and alert created',
      data: report,
    })
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Report transaction rollback failed:', rollbackError)
      }
    }

    console.error('Could not create report and alert:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not submit report',
    })
  } finally {
    client?.release()
  }
}

// Update report status
export async function updateReportStatus(request, response) {
  const { id } = request.params
  const { status } = request.body

  const allowedStatuses = ['New', 'Under Review', 'Resolved']

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid report ID',
    })
  }

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid report status',
    })
  }

  try {
    const result = await pool.query(
      `
        UPDATE reports
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `,
      [status, Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update report status:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not update report status',
    })
  }
}

// Assign or reassign an officer to a report
export async function assignReportOfficer(request, response) {
  const { id } = request.params
  const { officerId } = request.body

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid report ID',
    })
  }

  if (
    !Number.isInteger(Number(officerId)) ||
    Number(officerId) <= 0
  ) {
    return response.status(400).json({
      success: false,
      message: 'Valid officer ID is required',
    })
  }

  try {
    const officerResult = await pool.query(
      `
        SELECT id
        FROM users
        WHERE id = $1 AND role = 'officer'
      `,
      [Number(officerId)]
    )

    if (officerResult.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Officer not found',
      })
    }

    const result = await pool.query(
      `
        UPDATE reports
        SET assigned_officer_id = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `,
      [Number(officerId), Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Officer assigned successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not assign officer:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not assign officer',
    })
  }
}

// Delete report
export async function deleteReport(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    return response.status(400).json({
      success: false,
      message: 'Invalid report ID',
    })
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM reports
        WHERE id = $1
        RETURNING *
      `,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Report not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete report:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not delete report',
    })
  }
}
