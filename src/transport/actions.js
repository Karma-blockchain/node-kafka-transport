import Rx from "rxjs"
import uuid from "uuid"
import producer from "./producer"
import consumer from "./consumer"
import { pack, unpack } from "./utils"


const Source = new Rx.Subject()
const Subscriptions = new Map()


const ensureSubscription = async from => {
  if (Subscriptions.has(from)) return

  {
    (await consumer.init()).subscribe(from, messages => {
      messages.forEach(message => {
        Source.next({
          topic: from,
          message: unpack(message)
        })
      })
    })
  }

  Subscriptions.set(from, true)
}


export const push = async (to, payload, key) => {
  return new Promise(async (resolve, reject) => {
    producer.init().then(producer => {
      producer.send({
        topic: to,
        message: pack({ key, payload })
      }).then(([{ error, ...rest }]) => {
        if (error)
          return reject(error)
        resolve(rest)
      })
    })
  })
}


const subscription = async (from) => {
  await ensureSubscription(from)
  return Source.filter(payload => payload.topic === from)
}


export const subscribe = async (from, fn) => {
  return (await subscription(from))
    .subscribe(({ message }) => fn({
      key: message.key,
      value: message.value,
    }))
}


export const once = (from, key) => {
  return new Promise(async resolve => {
    const s = (await subscription(from))
      .filter(({ message }) => message.key === key)
      .subscribe(({ message }) => {
        s.unsubscribe()
        resolve(message.value)
      })
  })
}


export const fetch = async (to, from, payload) => {
  const key = uuid()
  push(to, payload, key)
  return once(from, key)
}
