import { v4 as uuid } from "uuid"
import consumer from "./consumer"
import producer from "./producer"
import { filter, timeout } from "rxjs/operators"
import { Subject } from "rxjs"
import { pack, unpack } from "./utils"

type KafkaMessage = {
  key: string
  value: any
}

type KafkaTopicMessage = {
  topic: string
  message: KafkaMessage
}

const Source = new Subject<KafkaTopicMessage>()
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
  if (!Subscriptions.has(from)) {
    Subscriptions.set(
      from,
      new Promise(resolve => {
        createSubscription(from).then(resolve)
      })
    )
  }
  return Subscriptions.get(from)
}

const subscription = async from => {
  await ensureSubscription(from)
  return Source.pipe(filter(payload => payload.topic === from))
}

export const push = async (to: string, payload: any, key: any) => {
  const connection = await producer.init()

  return connection.send({
    topic: to,
    message: pack({ key, payload }),
  })
}

export const subscribe = async (from: string, callback) => {
  const source = await subscription(from)

  return source.subscribe(payload => {
    callback({
      key: payload.message.key,
      value: payload.message.value,
    })
  })
}

export const once = async (from, key, _timeout) => {
  const source = await subscription(from)

  return new Promise<any>((resolve, reject) => {
    const subs = source
      .pipe<KafkaTopicMessage, KafkaTopicMessage>(
        filter(payload => payload.message.key === key),
        timeout<KafkaTopicMessage, KafkaTopicMessage>(_timeout)
      )
      .subscribe({
        next: payload => {
          subs.unsubscribe()
          resolve(payload.message.value)
        },
        error: err => {
          subs.unsubscribe()
          reject(err)
        },
      })
  })
}

export const fetch = async (
  to: string,
  from: string,
  payload: any,
  timeout: number = 100000
) => {
  await ensureSubscription(from)
  const key = uuid()
  push(to, payload, key)
  return once(from, key, timeout)
}
