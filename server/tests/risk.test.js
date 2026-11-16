
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../src/server.js'

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

const citizenToken = jwt.sign(
  { id: 3, role: 'citizen' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

describe('TerraWatch Risk API Validation', () => {
  it('should reject prediction without district', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        probability: 0.75,
        risk_level: 'High',
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject probability greater than 1', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: 1.5,
        risk_level: 'High',
      })

    assert.equal(response.status, 400)
  })

  it('should reject negative probability', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: -0.2,
        risk_level: 'High',
      })

    assert.equal(response.status, 400)
  })

  it('should reject invalid risk level', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: 0.75,
        risk_level: 'Extreme',
      })

    assert.equal(response.status, 400)
  })

  it('should reject invalid soil moisture', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: 0.75,
        risk_level: 'High',
        soil_moisture: 120,
      })

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Invalid rainfall, soil moisture, or slope value'
    )
  })

  it('should reject invalid slope', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: 0.75,
        risk_level: 'High',
        slope: 100,
      })

    assert.equal(response.status, 400)
  })

  it('should reject negative rainfall', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        probability: 0.75,
        risk_level: 'High',
        rainfall_24h: -10,
      })

    assert.equal(response.status, 400)
  })

  it('should reject invalid risk prediction ID', async () => {
    const response = await request(app)
      .delete('/api/risk/abc')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Invalid risk prediction ID'
    )
  })
})

describe('TerraWatch Risk API Authorization', () => {
  it('should prevent citizens from creating predictions', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({})

    assert.equal(response.status, 403)
  })

  it('should prevent officers from creating predictions', async () => {
    const response = await request(app)
      .post('/api/risk')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({})

    assert.equal(response.status, 403)
  })

  it('should prevent citizens from deleting predictions', async () => {
    const response = await request(app)
      .delete('/api/risk/1')
      .set('Authorization', `Bearer ${citizenToken}`)

    assert.equal(response.status, 403)
  })

  it('should prevent officers from deleting predictions', async () => {
    const response = await request(app)
      .delete('/api/risk/1')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
  })
})
