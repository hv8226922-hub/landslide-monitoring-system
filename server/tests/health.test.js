
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../src/server.js'

describe('TerraWatch Health API', () => {
  it('should return 200 when backend is running', async () => {
    const response = await request(app).get('/api/health')

    assert.equal(response.status, 200)
    assert.equal(response.body.success, true)
    assert.equal(
      response.body.message,
      'TerraWatch backend is running'
    )
    assert.ok(response.body.timestamp)
  })

  it('should return 404 for an unknown API route', async () => {
    const response = await request(app).get('/api/unknown-route')

    assert.equal(response.status, 404)
    assert.equal(response.body.success, false)
    assert.equal(response.body.message, 'API route not found')
  })
})
