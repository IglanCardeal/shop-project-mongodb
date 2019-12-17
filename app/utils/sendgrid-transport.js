const nodemailer = require('nodemailer')
const sendGrid = require('nodemailer-sendgrid-transport')
const dotenv = require('dotenv')

dotenv.config()

// Informamos ao nodemailer, qual o servico que sera usado para enviar emails.
// SendGrid sera usado como third service para o envio e tera as informacoes da key da conta.
module.exports = nodemailer.createTransport(
  sendGrid({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
)
