
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import app from '../src/server.js'
import pool from '../src/config/db.js'

const citizenToken = jwt.sign(
  { id: 1, role: 'citizen' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

const adminToken = jwt.sign(
  { id: 1, role: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

const officerToken = jwt.sign(
  { id: 2, role: 'officer' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

let testOfficerId

before(async () => {
  const officer = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'Officers API Test',
      `officers-api-${randomUUID()}@terrawatch.local`,
      'test-password-hash',
      'officer',
    ]
  )

  testOfficerId = officer.rows[0].id
})

after(async () => {
  if (testOfficerId) {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [testOfficerId]
    )
  }
})

describe('TerraWatch Authentication', () => {
  const protectedRoutes = [
    '/api/reports',
    '/api/alerts',
    '/api/weather',
    '/api/risk',
  ]

  for (const route of protectedRoutes) {
    it(`should reject unauthenticated access to ${route}`, async () => {
      const response = await request(app).get(route)

      assert.equal(response.status, 401)
      assert.equal(response.body.success, false)
      assert.ok(response.body.message)
    })
  }

  it('should reject an invalid authentication token', async () => {
    const response = await request(app)
      .get('/api/reports')
      .set('Authorization', 'Bearer invalid-token')

    assert.equal(response.status, 401)
    assert.equal(response.body.success, false)
  })
})

describe('TerraWatch Officers API', () => {
  it('should reject unauthenticated access to officers', async () => {
    const response = await request(app)
      .get('/api/auth/officers')

    assert.equal(response.status, 401)
    assert.equal(response.body.success, false)
  })

  it('should prevent citizens from viewing officers', async () => {
    const response = await request(app)
      .get('/api/auth/officers')
      .set('Authorization', `Bearer ${citizenToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should prevent officers from viewing officers', async () => {
    const response = await request(app)
      .get('/api/auth/officers')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should allow admins to view the officers list', async () => {
    const response = await request(app)
      .get('/api/auth/officers')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.ok(Array.isArray(response.body.data))

    const testOfficer = response.body.data.find(
      officer => officer.id === testOfficerId
    )

    assert.ok(testOfficer)
    assert.equal(testOfficer.name, 'Officers API Test')
    assert.ok(testOfficer.email)
  })
})
