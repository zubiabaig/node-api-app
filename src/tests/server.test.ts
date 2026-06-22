import request from 'supertest'
import { app } from '../server.ts'

describe('Health Check', () => {
  it('should rturn OK status', async () => {
    const response = await request(app).get('/health').expect(200)

    expect(response.body.status).toBe('OK')
    expect(response.body.service).toBe('Habit Tracker API')
  })
})
