import Kafka from "no-kafka"
import Config from "./config"


const ConfigKeys = [
  "groupId",
  "clientId",
  "connectionString",
  "idleTimeout",
  "maxWaitTime",
]


let consumer = null


const init = () => {
  if (consumer === null) {
    const config = ConfigKeys.reduce((memo, key) => {
      memo[key] = Config.get(key)
      return memo
    }, {})

    consumer = new Promise(resolve => {
      const instance = new Kafka.SimpleConsumer(config)
      instance.init().then(() => resolve(instance))
    })
  }

  return consumer
}


export default {
  init
}
