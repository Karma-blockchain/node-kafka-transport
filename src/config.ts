import { existy } from "./utils"

const ENV = new Map([
  ["groupId", "KAFKA_GROUP_ID"],
  ["clientId", "KAFKA_CLIENT_ID"],
  ["connectionString", "KAFKA_CONNECTION"],
  ["maxBytes", "KAFKA_MAX_BYTES"],
])

interface KafkaInitConfig {
  groupId?: string
  clientId?: string
  connectionString?: string
}

const CONFIG = new Map<string, any>([
  ["groupId", "kafka-transport-group"],
  ["clientId", "kafka-transport-client"],
  ["connectionString", "http://localhost:9092"],
  ["maxBytes", 1024 * 1024 * 10],
])

ENV.forEach((envKey, name) => {
  if (existy(process.env[envKey])) {
    CONFIG.set(name, process.env[envKey])
  }
})

const init = (config?: KafkaInitConfig) => {
  config = { ...config }
  CONFIG.forEach((value, key) => {
    if (existy(config[key])) CONFIG.set(key, config[key])
  })
}

export default CONFIG

export { init }
