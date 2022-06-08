import { EventEmitter } from 'events'
const emitter = new EventEmitter()

emitter.on('notify-mail', () => {
  // eslint-disable-next-line no-console
  console.log('sending email notification...')
})

emitter.emit('notify-mail')
