import z from 'zod'
import { validateBody } from '../src/middleware/validation.ts'

const schema = z.object({
  name: z.string().min(1),
  email: z.email(),
})

const middleware = validateBody(schema)

describe('validateBody middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = { body: {} }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    next = vi.fn()
  })
  it('should call next() with valid data', () => {
    req.body = {
      name: 'John',
      email: 'john@example.com',
    }
    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('should return 400 with invalid data', () => {
    req.body = { name: '', email: 'invalid-email' }

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
          message: expect.any(String),
        }),
      ]),
    })
  })
})
