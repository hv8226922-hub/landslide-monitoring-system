
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

try {
  await client.connect()

  const result = await client.query(`
    SELECT
      table_name,
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('weather_records', 'risk_predictions')
    ORDER BY table_name, ordinal_position
  `)

  console.table(result.rows)
} catch (error) {
  console.error(error.message)
} finally {
  await client.end()
}
