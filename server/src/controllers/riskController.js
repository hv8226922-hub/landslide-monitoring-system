
import pool from '../config/db.js'

// GET all risk predictions
export async function getRiskPredictions(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM risk_predictions
      ORDER BY predicted_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch risk predictions:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch risk predictions',
    })
  }
}

// CREATE risk prediction record
export async function createRiskPrediction(request, response) {
  const {
    district,
    probability,
    risk_level,
    rainfall_24h,
    soil_moisture,
    slope,
  } = request.body

  const probabilityValue = Number(probability)

  const optionalNumber = (value) => {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const number = Number(value)
    return Number.isFinite(number) ? number : NaN
  }

  const rainfall = optionalNumber(rainfall_24h)
  const soil = optionalNumber(soil_moisture)
  const slopeValue = optionalNumber(slope)

  if (
    typeof district !== 'string' ||
    !district.trim() ||
    probability === undefined ||
    probability === null ||
    probability === '' ||
    !Number.isFinite(probabilityValue) ||
    probabilityValue < 0 ||
    probabilityValue > 1 ||
    !['Low', 'Moderate', 'High', 'Critical'].includes(risk_level)
  ) {
    return response.status(400).json({
      success: false,
      message: 'Valid district, probability (0-1), and risk level are required',
    })
  }

  if (
    [rainfall, soil, slopeValue].some(Number.isNaN) ||
    (rainfall !== null && rainfall < 0) ||
    (soil !== null && (soil < 0 || soil > 100)) ||
    (slopeValue !== null && (slopeValue < 0 || slopeValue > 90))
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid rainfall, soil moisture, or slope value',
    })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO risk_predictions
          (district, probability, risk_level, rainfall_24h,
           soil_moisture, slope)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        district.trim(),
        probabilityValue,
        risk_level,
        rainfall,
        soil,
        slopeValue,
      ]
    )

    return response.status(201).json({
      success: true,
      message: 'Risk prediction record created successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create risk prediction:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not create risk prediction',
    })
  }
}
