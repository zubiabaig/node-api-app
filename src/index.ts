import { env } from '../env.ts'
import app from './server.ts'

//Start the server
app.listen(env.PORT, () => {
  console.log(`Server running on the port ${env.PORT}`)
  console.log(`Environment: ${env.APP_STAGE}`)
})
