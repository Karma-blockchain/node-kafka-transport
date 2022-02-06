import { SimpleConsumer } from "no-kafka"
import Config from "./config"

const ConfigKeys = [
  "groupId",
  "clientId",
  "connectionString",
  "idleTimeout",
  "maxWaitTime",
  "maxBytes",
]

const consumer = {
  config: null,
  current: null,
}

const getConfig = () => {
  return ConfigKeys.reduce((memo, key) => {
    memo[key] = Config.get(key)
    return memo
  }, {})
}

const getConsumer = () => {
  if (consumer.config === null) consumer.config = getConfig()
  return new SimpleConsumer(consumer.config)
}

const init = () => {
  if (consumer.current === null) consumer.current = getConsumer()
  consumer.current.init()
  return consumer.current
}

export default {
  init,
}
