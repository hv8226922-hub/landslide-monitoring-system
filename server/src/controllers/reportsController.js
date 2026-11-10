
import pool from '../config/db.js'

// Get all reports
export async function getReports(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM reports
      ORDER BY created_at DESC
    `)

    response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch reports:', error)

    response.status(500).json({
      success: false,
      message: 'Could not fetch reports',
    })
  }
}

// Create new report
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
  } = request.body

  if (!location || !description) {
    return response.status(400).json({
      success: false,
      message: 'Location and description are required',
    })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO reports (
          reporter_name,
          location,
          latitude,
          longitude,
          incident_type,
          severity,
          description,
          photo_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        reporterName || 'Anonymous citizen',
        location,
        latitude || null,
        longitude || null,
        incidentType,
        severity,
        description,
        photoUrl,
      ]
    )

    response.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create report:', error)

    response.status(500).json({
      success: false,
      message: 'Could not submit report',
    })
  }
}

// Update report status
export async function updateReportStatus(request, response) {
  const { id } = request.params
  const { status } = request.body

  const allowedStatuses = [
    'New',
    'Under Review',
    'Resolved',
  ]

  if (!/^\d+$/.test(id)) {
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

    response.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update report status:', error)

    response.status(500).json({
      success: false,
      message: 'Could not update report status',
    })
  }
}

// Delete report
export async function deleteReport(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id)) {
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

    response.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete report:', error)

    response.status(500).json({
      success: false,
      message: 'Could not delete report',
    })
  }
}
