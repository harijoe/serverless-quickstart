
const normalizedResponse = (config) => {
  return ({
    after: (handler, next) => {
      const { body, ...other } = handler.response
      handler.response = { body: JSON.stringify(body), ...other }
      next()
    },
  })
}

export default normalizedResponse
