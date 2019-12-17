const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const session = require('express-session')
const SessionStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const dotenv = require('dotenv')
const multer = require('multer')
const fileUploadHandler = require('./middleware/file-upload-handler')
const routes = require('./app/routes/export.routes')
const errorController = require('./app/controllers/error-controller')

// Middlewares.
const preventCsrf = require('./middleware/prevent-csrf')
const checkSession = require('./middleware/check-session')
const sessionSetup = require('./middleware/session-setup')
const serverErrorHandler = require('./middleware/server-error-handler')

dotenv.config()

const MONGODB_URL = `
mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
`

// Setup do app e armazenamento das sessoes.
const app = express()
const sessionDataBase = new SessionStore({
  uri: MONGODB_URL,
  collection: 'session',
})

// Setup das engines e views.
app.set('view engine', 'ejs')
app.set('views', './app/views')

/**
 * @helmet pode ajudar a proteger o aplicativo de algumas vulnerabilidades da web
 * bastante conhecidas configurando os cabeçalhos HTTP adequadamente.
 */
app.use(helmet())
app.use(session(sessionSetup(sessionDataBase)))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Armazenamento de imgs.
app.use(
  multer({
    storage: fileUploadHandler(multer).fileStorage,
    fileFilter: fileUploadHandler(multer).fileFilter,
  }).single('image')
)

app.use(express.static(path.join(__dirname, 'app', 'public')))
app.use(express.static(path.join(__dirname))) // para arquivos de imagens de usuario.
app.use(csrf())
app.use(flash())
app.use(checkSession)
app.use(preventCsrf)

// Setup das rotas.
app.use(routes)
app.use(errorController.get404)
app.use(serverErrorHandler)

module.exports = app
