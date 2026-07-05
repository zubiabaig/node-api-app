import { cleanupDatabase, createTestUser } from './helpers/dbHelpers.ts'

describe('Test Setup Verification', () => {
  test('Should connect to test database', async () => {
    const { user, token } = await createTestUser()
    expect(user).toBeDefined()
    expect(user.email).toContain('@example.com')
    expect(token).toBeDefined()

    await cleanupDatabase()
  })
})
