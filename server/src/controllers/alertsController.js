
import pool from '../config/db.js'

// GET all alerts
export async function getAlerts(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM alerts
      ORDER BY created_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch alerts:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch alerts',
    })
  }
}

// CREATE new alert
export async function createAlert(request, response) {
  const { title, district, riskLevel, message } = request.body

  // Validate input types
  if (
    typeof title !== 'string' ||
    typeof district !== 'string' ||
    typeof riskLevel !== 'string' ||
    typeof message !== 'string'
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid alert data',
    })
  }

  // Remove unnecessary spaces
  const cleanTitle = title.trim()
  const cleanDistrict = district.trim()
  const cleanMessage = message.trim()

  // Required field validation
  if (
    !cleanTitle ||
    !cleanDistrict ||
    !riskLevel ||
    !cleanMessage
  ) {
    return response.status(400).json({
      success: false,
      message: 'Title, district, risk level and message are required',
    })
  }

  // Length validation according to database schema
  if (
    cleanTitle.length > 200 ||
    cleanDistrict.length > 120 ||
    cleanMessage.length > 5000
  ) {
    return response.status(400).json({
      success: false,
      message: 'Alert input exceeds the allowed length',
    })
  }

  // Risk level validation
  const allowedLevels = ['Low', 'Moderate', 'High', 'Critical']

  if (!allowedLevels.includes(riskLevel)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid risk level',
    })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO alerts (title, district, risk_level, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [cleanTitle, cleanDistrict, riskLevel, cleanMessage]
    )

    return response.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create alert:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not create alert',
    })
  }
}

// UPDATE alert status
export async function updateAlertStatus(request, response) {
  const { id } = request.params
  const { status } = request.body

  // Validate alert ID
  if (!/^[1-9]\d*$/.test(id)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid alert ID',
    })
  }

  // Validate status
  const allowedStatuses = ['Active', 'Acknowledged', 'Resolved']

  if (!allowedStatuses.includes(status)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid alert status',
    })
  }

  try {
    const result = await pool.query(
      `
        UPDATE alerts
        SET status = $1
        WHERE id = $2
        RETURNING *
      `,
      [status, Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Alert not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Alert status updated successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update alert:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not update alert',
    })
  }
}

// DELETE alert
export async function deleteAlert(request, response) {
  const { id } = request.params

  // Validate alert ID
  if (!/^[1-9]\d*$/.test(id)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid alert ID',
    })
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM alerts
        WHERE id = $1
        RETURNING *
      `,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Alert not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete alert:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not delete alert',
    })
  }
}
