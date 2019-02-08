import uuid from "uuid"
import consumer from "./consumer"
import producer from "./producer"
import { filter } from "rxjs/operators"
import { Subject } from "rxjs"
import { pack, unpack } from "./utils"

const Source = new Subject()
const Subscriptions = new Map()

const createSubscription = async from => {
  const connection = await consumer.init()

  connection.subscribe(from, messages => {
    messages.forEach(message => {
      Source.next({
        topic: from,
        message: unpack(message),
      })
    })
  })
}

const ensureSubscription = async from => {
  if (Subscriptions.has(from)) return
  await createSubscription(from)
  Subscriptions.set(from, true)
}

const subscription = async from => {
  await ensureSubscription(from)
  return Source.pipe(filter(payload => payload.topic === from))
}

export const push = async (to, payload, key) => {
  const connection = await producer.init()

  return connection.send({
    topic: to,
    message: pack({ key, payload }),
  })
}

export const subscribe = async (from, callback) => {
  const source = await subscription(from)

  return source.subscribe(payload => {
    callback({
      key: payload.message.key,
      value: payload.message.value,
    })
  })
}

export const once = async (from, key) => {
  const source = await subscription(from)

  return new Promise(resolve => {
    source
      .pipe(filter(payload => payload.message.key === key))
      .subscribe(payload => {
        source.unsubscribe()
        resolve(payload.message.value)
      })
  })
}

export const fetch = async (to, from, payload) => {
  await ensureSubscription(from)
  const key = uuid()
  push(to, payload, key)
  return once(from, key)
}
