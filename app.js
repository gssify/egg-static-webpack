'use strict'
const constant = require('./lib/constant')

module.exports = app => {
  app.use(async (ctx, next) => {
    if (app.__webpack_build_done) {
      await next()
    } else {
      ctx.body = app.config.staticWebpack.loading
    }
  })

  app.messenger.on(constant.EVENT_BUILD_DONE, ({ data }) => {
    app.__webpack_build_done = data
  })

  app.ready(() => {
    app.messenger.sendToAgent(constant.EVENT_BUILD_DONE)
  })
}
