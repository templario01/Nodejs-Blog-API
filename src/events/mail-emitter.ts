import { EventEmitter } from 'events'
import * as sgMail from '@sendgrid/mail'
import { mailBody } from './mail.request'

export const emitter = new EventEmitter()

emitter.on('notify-mail', (request: mailBody) => {
  const { email } = request
  const senderEmail = process.env.SENDER_EMAIL as string
  sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

  const msg = {
    to: email, // Change to your recipient
    from: senderEmail, // Change to your verified sender
    subject: request.subject ?? 'Sending with SendGrid is Fun',
    text: request.text ?? 'and easy to do anywhere, even with Node.js',
    html:
      request.html ??
      '<strong>and easy to do anywhere, even with Node.js</strong>',
  }

  sgMail
    .send(msg)
    .then((response) => {
      // eslint-disable-next-line no-console
      console.log(response[0].statusCode)
      // eslint-disable-next-line no-console
      console.log(response[0].headers)
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  // eslint-disable-next-line no-console
  console.log('sending email notification...')
})
