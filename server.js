const dotenv = require('dotenv')

const dataBaseConnection = require('./database/connection')
const app = require('./app')

dotenv.config()

const PORT = process.env.PORT || 3000

try {
  dataBaseConnection(() => {
    console.log('Connection to MongoDB stablished with success!')

    app.listen(PORT, () => {
      console.log(`Server On - PORT ${PORT} `)
      console.log(`Enviroment: ${process.env.NODE_ENV} `)
    })
  })
} catch (error) {
  console.log('Error while starting the server: ', error)
}
