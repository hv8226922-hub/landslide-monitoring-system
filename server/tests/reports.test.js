
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

let firstCitizenId
let secondCitizenId
let firstCitizenToken
let secondCitizenToken
let createdReportId

before(async () => {
  const firstUser = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'Test Citizen One',
      `citizen-one-${randomUUID()}@terrawatch.local`,
      'test-password-hash',
      'citizen',
    ]
  )

  firstCitizenId = firstUser.rows[0].id

  const secondUser = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'Test Citizen Two',
      `citizen-two-${randomUUID()}@terrawatch.local`,
      'test-password-hash',
      'citizen',
    ]
  )

  secondCitizenId = secondUser.rows[0].id

  firstCitizenToken = jwt.sign(
    { id: firstCitizenId, role: 'citizen' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  )

  secondCitizenToken = jwt.sign(
    { id: secondCitizenId, role: 'citizen' },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  )
})

after(async () => {
  if (createdReportId) {
    await pool.query(
      'DELETE FROM reports WHERE id = $1',
      [createdReportId]
    )
  }

  if (firstCitizenId) {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [firstCitizenId]
    )
  }

  if (secondCitizenId) {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [secondCitizenId]
    )
  }
})

describe('TerraWatch Report API Validation', () => {
  it('should reject a report without location', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        description: 'Heavy rainfall reported',
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
    assert.equal(
      response.body.message,
      'Location and description are required'
    )
  })

  it('should reject a report without description', async () => {
    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        location: 'Dima Hasao, Assam',
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject an invalid report ID', async () => {
    const response = await request(app)
      .patch('/api/reports/abc/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid report ID')
  })

  it('should reject an invalid report status', async () => {
    const response = await request(app)
      .patch('/api/reports/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Verified' })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid report status')
  })

  it('should reject an invalid report ID when deleting', async () => {
    const response = await request(app)
      .delete('/api/reports/abc')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid report ID')
  })

  it('should prevent citizens from viewing all reports', async () => {
    const response = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${citizenToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should prevent citizens from updating report status', async () => {
    const response = await request(app)
      .patch('/api/reports/1/status')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ status: 'Resolved' })

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should prevent officers from deleting reports', async () => {
    const response = await request(app)
      .delete('/api/reports/1')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })
})

describe('TerraWatch Citizen Report History', () => {
  it('should allow citizens to view only their own reports', async () => {
    const createResponse = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${firstCitizenToken}`)
      .send({
        reporterName: 'Test Citizen One',
        location: 'Dima Hasao, Assam',
        incidentType: 'Landslide',
        severity: 'High',
        description: 'Testing citizen report ownership',
      })

    assert.equal(createResponse.status, 201)
    assert.equal(createResponse.body.success, true)

    createdReportId = createResponse.body.data.id

    const firstResponse = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${firstCitizenToken}`)

    assert.equal(firstResponse.status, 200)
    assert.equal(firstResponse.body.success, true)
    assert.ok(
      firstResponse.body.data.some(
        report => report.id === createdReportId
      )
    )

    const secondResponse = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${secondCitizenToken}`)

    assert.equal(secondResponse.status, 200)
    assert.equal(secondResponse.body.success, true)

    assert.equal(
      secondResponse.body.data.some(
        report => report.id === createdReportId
      ),
      false
    )
  })

  it('should prevent admins from accessing citizen report history', async () => {
    const response = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should prevent officers from accessing citizen report history', async () => {
    const response = await request(app)
      .get('/api/reports/my-reports')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })
})

describe('TerraWatch Officer Assignment API', () => {
  let testOfficerOneId
  let testOfficerTwoId
  let testReportId

  before(async () => {
    const officerOne = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'Test Officer One',
        `officer-one-${randomUUID()}@terrawatch.local`,
        'test-password-hash',
        'officer',
      ]
    )

    testOfficerOneId = officerOne.rows[0].id

    const officerTwo = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        'Test Officer Two',
        `officer-two-${randomUUID()}@terrawatch.local`,
        'test-password-hash',
        'officer',
      ]
    )

    testOfficerTwoId = officerTwo.rows[0].id

    const reportResponse = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${firstCitizenToken}`)
      .send({
        reporterName: 'Assignment Test Citizen',
        location: 'Dima Hasao, Assam',
        incidentType: 'Landslide',
        severity: 'High',
        description: 'Testing officer assignment',
      })

    assert.equal(reportResponse.status, 201)

    testReportId = reportResponse.body.data.id
  })

  after(async () => {
    if (testReportId) {
      await pool.query(
        'DELETE FROM reports WHERE id = $1',
        [testReportId]
      )
    }

    if (testOfficerOneId) {
      await pool.query(
        'DELETE FROM users WHERE id = $1',
        [testOfficerOneId]
      )
    }

    if (testOfficerTwoId) {
      await pool.query(
        'DELETE FROM users WHERE id = $1',
        [testOfficerTwoId]
      )
    }
  })

  it('should allow admin to assign an officer', async () => {
    const response = await request(app)
      .patch(`/api/reports/${testReportId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        officerId: testOfficerOneId,
      })

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.equal(
      response.body.data.assigned_officer_id,
      testOfficerOneId
    )
  })

  it('should allow admin to reassign an officer', async () => {
    const response = await request(app)
      .patch(`/api/reports/${testReportId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        officerId: testOfficerTwoId,
      })

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.equal(
      response.body.data.assigned_officer_id,
      testOfficerTwoId
    )
  })

  it('should reject assignment by citizens', async () => {
    const response = await request(app)
      .patch(`/api/reports/${testReportId}/assign`)
      .set('Authorization', `Bearer ${firstCitizenToken}`)
      .send({
        officerId: testOfficerOneId,
      })

    assert.equal(response.status, 403)
    assert.equal(response.body.success, false)
  })

  it('should reject an invalid report ID', async () => {
    const response = await request(app)
      .patch('/api/reports/abc/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        officerId: testOfficerOneId,
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid report ID')
  })

  it('should reject a non-existent officer ID', async () => {
    const response = await request(app)
      .patch(`/api/reports/${testReportId}/assign`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        officerId: 999999999,
      })

    assert.equal(response.status, 404)
    assert.equal(response.body.message, 'Officer not found')
  })
})
