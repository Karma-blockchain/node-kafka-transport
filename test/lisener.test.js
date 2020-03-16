import { init, push, Listener } from "../src"
import dotenv from "dotenv"

dotenv.config()

const { TO_TOPIC, FROM_TOPIC, KAFKA_CONNECTION } = process.env

describe("Listener", function() {
  let listener = null
  describe("#addActions()", function() {
    before("init kafka", async () => {
      await init({ connectionString: KAFKA_CONNECTION })

      listener = await Listener(TO_TOPIC, FROM_TOPIC)
    })

    it("test Listener", function() {
      this.timeout = 25000
      return new Promise(async (resolve, reject) => {
        listener.addActions({
          test: data => {
            console.log(`call action 'test' with data=${data}`)
            resolve()
            return "fine work"
          },
        })

        push(TO_TOPIC, { action: "test", data: "Hello" }, "test-listener")
      })
    })
  })
})
