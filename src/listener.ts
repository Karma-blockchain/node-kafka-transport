import { subscribe, push } from "./actions"

export default (consumerTopic, producerTopic) => {
  const actions = {}

  const subscribed = subscribe(
    consumerTopic,
    async ({ key, value: { action, data } }) => {
      if (actions[action] == undefined) return

      try {
        let result = await actions[action](data, { key, action })

        if (producerTopic != undefined && result != undefined)
          push(producerTopic, { data: result }, key)
      } catch (error) {
        if (producerTopic != undefined)
          push(producerTopic, { errors: [error.message] }, key)
      }
    }
  )

  return {
    addActions: _actions => Object.assign(actions, _actions),
    subscribed,
  }
}
