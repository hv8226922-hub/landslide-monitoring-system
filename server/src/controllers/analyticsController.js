
import pool from '../config/db.js'

// GET Admin Analytics
export async function getAnalytics(request, response) {
  try {
    const [
      reportResult,
      riskResult,
      summaryResult,
    ] = await Promise.all([
      // Report counts by location
      pool.query(`
        SELECT
          CASE
            WHEN LENGTH(TRIM(location)) >= 3
            THEN INITCAP(TRIM(location))
            ELSE 'Other / Unverified'
          END AS district,
          COUNT(*)::INTEGER AS incidents
        FROM reports
        GROUP BY 1
        ORDER BY incidents DESC
      `),

      // Risk-level distribution
      pool.query(`
        SELECT
          risk_level AS name,
          COUNT(*)::INTEGER AS value
        FROM risk_predictions
        GROUP BY risk_level
        ORDER BY
          CASE risk_level
            WHEN 'Low' THEN 1
            WHEN 'Moderate' THEN 2
            WHEN 'High' THEN 3
            WHEN 'Critical' THEN 4
            ELSE 5
          END
      `),

      // Overall summary
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM reports)::INTEGER AS total_reports,
          (SELECT COUNT(*) FROM risk_predictions)::INTEGER AS total_predictions,
          (
            SELECT ROUND(AVG(probability) * 100, 2)
            FROM risk_predictions
          ) AS average_probability
      `),
    ])

    return response.status(200).json({
      success: true,
      data: {
        districtData: reportResult.rows,
        riskData: riskResult.rows,
        summary: summaryResult.rows[0],
      },
    })
  } catch (error) {
    console.error('Could not fetch analytics:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch analytics',
    })
  }
}
