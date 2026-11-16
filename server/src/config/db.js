
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({
  path: new URL(
    process.env.NODE_ENV === 'test'
      ? '../../.env.test'
      : '../../.env',
    import.meta.url
  ),
})

const { Pool } = pg

const databaseUrl = process.env.DATABASE_URL

const pool = new Pool(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl:
          process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: true }
            : undefined,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
)

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL error:', error)
})

export default pool
