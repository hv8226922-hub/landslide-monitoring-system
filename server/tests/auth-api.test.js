
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import app from '../src/server.js'

describe('TerraWatch Registration API Validation', () => {
  it('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject an invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      })

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Please enter a valid email address'
    )
  })

  it('should reject an empty name', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: '   ',
        email: 'test@example.com',
        password: 'password123',
      })

    assert.equal(response.status, 400)
  })

  it('should reject a name longer than 100 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A'.repeat(101),
        email: 'test@example.com',
        password: 'password123',
      })

    assert.equal(response.status, 400)
  })

  it('should reject a password shorter than 8 characters', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      })

    assert.equal(response.status, 400)
  })

  it('should reject a password exceeding 72 UTF-8 bytes', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'a'.repeat(73),
      })

    assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Password must not exceed 72 bytes'
    )
  })
})

describe('TerraWatch Login API Validation', () => {
  it('should reject login with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({})

    assert.equal(response.status, 400)
    assert.equal(response.body.success, false)
  })

  it('should reject an invalid login email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: 'password123',
        role: 'citizen',
      })

    assert.equal(response.status, 400)
  })

  it('should reject an unsupported role', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'superadmin',
      })

    assert.equal(response.status, 400)
    assert.equal(response.body.message, 'Invalid role')
  })

  it('should reject a password exceeding 72 UTF-8 bytes', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'a'.repeat(73),
        role: 'citizen',
      })

assert.equal(response.status, 400)
    assert.equal(
      response.body.message,
      'Invalid email or password'
    )
  })
})
