import Kafka from "no-kafka"
import Config from "./config"


const ConfigKeys = ["clientId", "connectionString"]


let producer = null


const init = () => {
  if (producer === null) {
    const config = ConfigKeys.reduce((memo, key) => {
      memo[key] = Config.get(key)
      return memo
    }, {})

    producer = new Promise(resolve => {
      const instance = new Kafka.Producer(config)
      instance.init().then(() => resolve(instance))
    })
  }

  return producer
}


export default {
  init
}
