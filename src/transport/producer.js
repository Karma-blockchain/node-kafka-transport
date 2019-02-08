import Kafka from "no-kafka"
import Config from "./config"

const ConfigKeys = ["clientId", "connectionString"]

const producer = {
  config: null,
  current: null,
}

const getConfig = () => {
  return ConfigKeys.reduce((memo, key) => {
    memo[key] = Config.get(key)
    return memo
  }, {})
}

const getProducer = () => {
  if (producer.config === null) producer.config = getConfig()
  return new Kafka.Producer(producer.config)
}

const init = () => {
  if (producer.current === null) producer.current = getProducer()
  producer.current.init()
  return producer.current
}

export default {
  init,
}
