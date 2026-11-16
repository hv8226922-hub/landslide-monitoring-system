
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

describe('TerraWatch Weather API Validation', () => {
  it('should reject weather record without district', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ rainfall_24h: 25 })

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject negative rainfall', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        rainfall_24h: -10,
      })

    assert.equal(response.status, 400)
  })

  it('should reject invalid humidity', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        rainfall_24h: 25,
        humidity: 120,
      })

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Invalid humidity or temperature value'
    )
  })

  it('should reject non-numeric temperature', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        district: 'Dima Hasao',
        rainfall_24h: 25,
        temperature: 'hot',
      })

    assert.equal(response.status, 400)
  })

  it('should reject invalid weather record ID', async () => {
    const response = await request(app)
      .delete('/api/weather/abc')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Invalid weather record ID'
    )
  })
})

describe('TerraWatch Weather API Authorization', () => {
  it('should prevent citizens from creating weather records', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({})

    assert.equal(response.status, 403)
  })

  it('should prevent officers from creating weather records', async () => {
    const response = await request(app)
      .post('/api/weather')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({})

    assert.equal(response.status, 403)
  })

  it('should prevent citizens from deleting weather records', async () => {
    const response = await request(app)
      .delete('/api/weather/1')
      .set('Authorization', `Bearer ${citizenToken}`)

    assert.equal(response.status, 403)
  })

  it('should prevent officers from deleting weather records', async () => {
    const response = await request(app)
      .delete('/api/weather/1')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
  })
})

