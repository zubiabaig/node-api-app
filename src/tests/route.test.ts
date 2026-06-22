import request from 'supertest'
import { app } from '../server.ts'

describe('User Routes', () => {
  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const response = await request(app).get('/api/users').expect(200)

      expect(response.body).toHaveProperty('users')
      expect(Array.isArray(response.body.users)).toBe(true)
    })
  })

  describe('GET /api/user/:id', () => {
    it('should return specific user', async () => {
      const response = await request(app).get('/api/users/123').expect(200)

      expect(response.body.user.id).toBe('123')
    })

    it('should return 404 for non-existent user', async () => {
      await request(app).get('/api/users/999').expect(404)
    })
  })
})

describe('Route Parameters', () => {
  it('should handle path parameters', async () => {
    const response = await request(app)
      .get('/api/users/123/habits/456')
      .expect(200)

    expect(response.body.userId).toBe('123')
    expect(response.body.habitId).toBe('456')
  })

  it('should handle query parameters', async () => {
    const response = await request(app)
      .get('/api/users?page=2&limit=10')
      .expect(200)

    expect(response.body.page).toBe(2)
    expect(response.body.limit).toBe(10)
  })
})
