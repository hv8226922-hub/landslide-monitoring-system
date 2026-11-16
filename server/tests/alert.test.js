
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

const citizenToken = jwt.sign(
  { id: 2, role: 'citizen' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

const officerToken = jwt.sign(
  { id: 3, role: 'officer' },
  process.env.JWT_SECRET,
  { expiresIn: '5m' }
)

describe('TerraWatch Alert API Validation', () => {
  it('should reject alert without required fields', async () => {
    const response = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Heavy rainfall alert' })

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject an invalid risk level', async () => {
    const response = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Heavy rainfall alert',
        district: 'Dima Hasao',
        riskLevel: 'Extreme',
        message: 'Heavy rainfall reported',
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid risk level')
  })

  it('should reject an invalid alert ID when updating', async () => {
    const response = await request(app)
      .patch('/api/alerts/abc/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid alert ID')
  })

  it('should reject an invalid alert status', async () => {
    const response = await request(app)
      .patch('/api/alerts/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Verified' })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid alert status')
  })

  it('should reject an invalid alert ID when deleting', async () => {
    const response = await request(app)
      .delete('/api/alerts/abc')
      .set('Authorization', `Bearer ${adminToken}`)

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid alert ID')
  })
})

describe('TerraWatch Alert API Authorization', () => {
  it('should prevent citizens from creating alerts', async () => {
    const response = await request(app)
      .post('/api/alerts')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({})

    assert.equal(response.status, 403)
  })

  it('should prevent citizens from updating alert status', async () => {
    const response = await request(app)
      .patch('/api/alerts/1/status')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ status: 'Resolved' })

    assert.equal(response.status, 403)
  })

  it('should prevent officers from deleting alerts', async () => {
    const response = await request(app)
      .delete('/api/alerts/1')
      .set('Authorization', `Bearer ${officerToken}`)

    assert.equal(response.status, 403)
  })
})
