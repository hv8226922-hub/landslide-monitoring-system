
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import app from '../src/server.js'
import pool from '../src/config/db.js'

let adminToken
let testUserId

const testUserEmail = `test-admin-${randomUUID()}@terrawatch.local`

// Create a valid Admin user in the test database
before(async () => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'TerraWatch Test Admin',
      testUserEmail,
      'test-password-hash',
      'admin',
    ]
  )

  testUserId = result.rows[0].id

  adminToken = jwt.sign(
    { id: testUserId, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  )
})

// Remove the temporary Admin user after tests
after(async () => {
  if (testUserId) {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [testUserId]
    )
  }
})

const routes = [
  '/api/reports',
  '/api/alerts',
  '/api/weather',
  '/api/risk',
]

describe('TerraWatch Database Read Tests', () => {
  for (const route of routes) {
    it(`should fetch database records from ${route}`, async () => {
      const response = await request(app)
        .get(route)
        .set('Authorization', `Bearer ${adminToken}`)

      assert.equal(response.status, 200)
      assert.equal(response.body.success, true)
      assert.ok(Array.isArray(response.body.data))
    })
  }
})

describe('TerraWatch Report Database Write Tests', () => {
  it('should create, update and delete a test report', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reporterName: 'TerraWatch Test',
        location: 'Test Location, Assam',
        incidentType: 'Landslide',
        severity: 'High',
        description: 'Automated database integration test',
      })

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.success, true)

    const reportId = createResponse.body.data.id

    assert.ok(reportId)

    // UPDATE
    const updateResponse = await request(app)
      .patch(`/api/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Under Review' })

    assert.equal(updateResponse.status, 200)
    assert.equal(updateResponse.body.success, true)
    assert.equal(updateResponse.body.data.status, 'Under Review')

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(deleteResponse.status, 200)
    assert.equal(deleteResponse.body.success, true)
    assert.equal(deleteResponse.body.data.id, reportId)
  })
})

describe('TerraWatch Alert Database Write Tests', () => {
  it('should create, update and delete a test alert', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Automated Test Alert',
        district: 'Test District',
        riskLevel: 'High',
        message: 'Testing alert database operations',
      })

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.success, true)

    const alertId = createResponse.body.data.id

    assert.ok(alertId)

    // UPDATE
    const updateResponse = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Acknowledged' })

    assert.equal(updateResponse.status, 200)
    assert.equal(updateResponse.body.success, true)
    assert.equal(updateResponse.body.data.status, 'Acknowledged')

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/alerts/${alertId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(deleteResponse.status, 200)
    assert.equal(deleteResponse.body.success, true)
    assert.equal(deleteResponse.body.data.id, alertId)
  })
})

describe('TerraWatch Weather Database Write Tests', () => {
  it('should create and delete a test weather record', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Test District',
        rainfall_24h: 45.5,
        humidity: 80,
        temperature: 24,
      })

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.success, true)

    const weatherId = createResponse.body.data.id

    assert.ok(weatherId)

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/weather/${weatherId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(deleteResponse.status, 200)
    assert.equal(deleteResponse.body.success, true)
    assert.equal(deleteResponse.body.data.id, weatherId)
  })
})

describe('TerraWatch Risk Database Write Tests', () => {
  it('should create and delete a test risk prediction', async () => {
    // CREATE
    const createResponse = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Test District',
        probability: 0.75,
        risk_level: 'High',
        rainfall_24h: 45.5,
        soil_moisture: 80,
        slope: 35,
      })

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.success, true)

    const riskId = createResponse.body.data.id

    assert.ok(riskId)

    // DELETE
    const deleteResponse = await request(app)
      .delete(`/api/risk/${riskId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(deleteResponse.status, 200)
    assert.equal(deleteResponse.body.success, true)
    assert.equal(deleteResponse.body.data.id, riskId)
  })
})
