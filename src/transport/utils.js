import msgpack from "msgpack"


export const existy = value =>
  value !== null && value !== void 0


export const pack = ({ key, payload }) => {
  return {
    key: existy(key) ? key : null,
    value: msgpack.pack(payload),
  }
}


export const unpack = ({ message }) => {
  return {
    key: existy(message.key) ? message.key.toString() : null,
    value: msgpack.unpack(message.value),
  }
}
