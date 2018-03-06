const constant = require('./lib/constant')
const Server = require('./lib/server')

module.exports = agent => {
  agent.messenger.on('egg-ready', () => {
    const webpackServer = new Server(agent)
    webpackServer.start(() => {
      agent.__webpack_build_done = true
      agent.messenger.sendToApp(constant.EVENT_BUILD_DONE, { data: true })
    })
    agent.messenger.on(constant.EVENT_BUILD_DONE, () => {
      agent.messenger.sendToApp(constant.EVENT_BUILD_DONE, { data: agent.__webpack_build_done })
    })
  })
}
