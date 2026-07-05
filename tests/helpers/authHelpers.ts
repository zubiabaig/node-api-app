import request from 'supertest'
import app from '../../src/server.ts'
import { createTestUser } from './dbHelpers.ts'

// Restrict method strings to valid Supertest function names
type RequestMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

//Helper function for authenticated requests
export const authenticatedRequest = async (
  method: RequestMethod,
  url: string,
) => {
  const { token } = await createTestUser()
  return request(app)[method](url).set('Authorization', `Bearer ${token}`)
}
