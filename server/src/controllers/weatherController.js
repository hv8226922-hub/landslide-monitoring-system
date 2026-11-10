
import pool from '../config/db.js'

// GET all weather records
export async function getWeatherRecords(request, response) {
  try {
    const result = await pool.query(`
      SELECT *
      FROM weather_records
      ORDER BY recorded_at DESC
    `)

    return response.status(200).json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Could not fetch weather records:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not fetch weather records',
    })
  }
}

// CREATE weather record
export async function createWeatherRecord(request, response) {
  const { district, rainfall_24h, humidity, temperature } = request.body

  const rainfall = Number(rainfall_24h)

  if (
    typeof district !== 'string' ||
    !district.trim() ||
    rainfall_24h === undefined ||
    rainfall_24h === null ||
    rainfall_24h === '' ||
    !Number.isFinite(rainfall) ||
    rainfall < 0
  ) {
    return response.status(400).json({
      success: false,
      message: 'Valid district and rainfall are required',
    })
  }

  const optionalNumber = (value) => {
    if (value === undefined || value === null || value === '') {
      return null
    }

    const number = Number(value)
    return Number.isFinite(number) ? number : NaN
  }

  const humidityValue = optionalNumber(humidity)
  const temperatureValue = optionalNumber(temperature)

  if (
    Number.isNaN(humidityValue) ||
    (humidityValue !== null &&
      (humidityValue < 0 || humidityValue > 100)) ||
    Number.isNaN(temperatureValue)
  ) {
    return response.status(400).json({
      success: false,
      message: 'Invalid humidity or temperature value',
    })
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO weather_records
          (district, rainfall_24h, humidity, temperature)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [
        district.trim(),
        rainfall,
        humidityValue,
        temperatureValue,
      ]
    )

    return response.status(201).json({
      success: true,
      message: 'Weather record created successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not create weather record:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not create weather record',
    })
  }
}

// DELETE weather record
export async function deleteWeatherRecord(request, response) {
  const { id } = request.params

  if (!/^\d+$/.test(id)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid weather record ID',
    })
  }

  try {
    const result = await pool.query(
      `
        DELETE FROM weather_records
        WHERE id = $1
        RETURNING *
      `,
      [Number(id)]
    )

    if (result.rows.length === 0) {
      return response.status(404).json({
        success: false,
        message: 'Weather record not found',
      })
    }

    return response.status(200).json({
      success: true,
      message: 'Weather record deleted successfully',
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Could not delete weather record:', error)

    return response.status(500).json({
      success: false,
      message: 'Could not delete weather record',
    })
  }
}
