import uuid from "uuid"
import consumer from "./consumer"
import producer from "./producer"
import { filter } from "rxjs/operators"
import { Subject } from "rxjs"
import { pack, unpack } from "./utils"


const Source = new Subject()
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
  return Source.pipe(filter(payload => payload.topic === from))
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
      .pipe(filter(({ message }) => message.key === key))
      .subscribe(({ message }) => {
        s.unsubscribe()
        resolve(message.value)
      })
  })
}


export const fetch = async (to, from, payload) => {
  const key = uuid()
  await ensureSubscription(from)
  const answer = once(from, key)
  push(to, payload, key)
  return answer
}
