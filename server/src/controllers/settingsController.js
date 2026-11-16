
import pool from '../config/db.js'

const allowedLanguages = ['English', 'Hindi', 'Assamese']

function validateSettings(data) {
  const {
    notificationsEnabled,
    highRiskAlertsEnabled,
    riskThreshold,
    dashboardLanguage,
  } = data

  if (
    typeof notificationsEnabled !== 'boolean' ||
    typeof highRiskAlertsEnabled !== 'boolean'
  ) {
    return 'Notification settings must be true or false'
  }

  if (
    !Number.isInteger(Number(riskThreshold)) ||
    Number(riskThreshold) < 0 ||
    Number(riskThreshold) > 100
  ) {
    return 'Risk threshold must be between 0 and 100'
  }

  if (!allowedLanguages.includes(dashboardLanguage)) {
    return 'Invalid dashboard language'
  }

  return null
}

// GET admin settings
export async function getSettings(request, response) {
  try {
    const adminId = request.user.id

    const result = await pool.query(
      `
        INSERT INTO admin_settings (admin_id)
        VALUES ($1)
        ON CONFLICT (admin_id) DO NOTHING
      `,
      [adminId]
    )

    const settings = await pool.query(
      `
        SELECT
          notifications_enabled,
          high_risk_alerts_enabled,
          risk_threshold,
          dashboard_language,
          updated_at
        FROM admin_settings
        WHERE admin_id = $1
      `,
      [adminId]
    )

    return response.status(200).json({
      success: true,
      data: settings.rows[0],
    })
  } catch (error) {
    console.error('Could not fetch settings:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
    })
  }
}

// UPDATE admin settings
export async function updateSettings(request, response) {
  try {
    const adminId = request.user.id
    const validationError = validateSettings(request.body)

    if (validationError) {
      return response.status(400).json({
        success: false,
        message: validationError,
      })
    }

    const {
      notificationsEnabled,
      highRiskAlertsEnabled,
      riskThreshold,
      dashboardLanguage,
    } = request.body

    const result = await pool.query(
      `
        INSERT INTO admin_settings (
          admin_id,
          notifications_enabled,
          high_risk_alerts_enabled,
          risk_threshold,
          dashboard_language,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (admin_id)
        DO UPDATE SET
          notifications_enabled = EXCLUDED.notifications_enabled,
          high_risk_alerts_enabled = EXCLUDED.high_risk_alerts_enabled,
          risk_threshold = EXCLUDED.risk_threshold,
          dashboard_language = EXCLUDED.dashboard_language,
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          notifications_enabled,
          high_risk_alerts_enabled,
          risk_threshold,
          dashboard_language,
          updated_at
      `,
      [
        adminId,
        notificationsEnabled,
        highRiskAlertsEnabled,
        Number(riskThreshold),
        dashboardLanguage,
      ]
    )

    return response.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not update settings:', error)

    return response.status(500).json({
      success: false,
      message: 'Failed to save settings',
    })
  }
}
