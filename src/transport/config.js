import { existy } from "./utils"


const ENV = new Map([
  ["groupId", "KAFKA_GROUP_ID"],
  ["clientId", "KAFKA_CLIENT_ID"],
  ["connectionString", "KAFKA_CONNECTION"]
])


const CONFIG = new Map([
  ["groupId", "kafka-transport-client"],
  ["clientId", "kafka-transport-group"],
  ["connectionString", "http://localhost:9092"],
  ["idleTimeout", 0],
  ["maxWaitTime", 0],
])


ENV.forEach((envKey, name) => {
  if (existy(process.env[envKey])) {
    CONFIG.set(name, process.env[envKey])
  }
})


const init = config => {
  config = { ...config }
  CONFIG.forEach((value, key) => {
    if (existy(config[key]))
      CONFIG.set(key, config[key])
  })
}


export default CONFIG

export {
  init
}
