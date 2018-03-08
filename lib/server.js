'use strict'
const Koa = require('koa')
const webpack = require('webpack')
const cors = require('@koa/cors')

const app = new Koa()
app.use(cors())

function normalizeConfig (config) {
  const { port, webpackConfig = {} } = config
  const { output } = webpackConfig
  const hotMiddlewareScript = `webpack-hot-middleware/client?reload=true&path=http://localhost:${port}/__webpack_hmr`
  const entry = {}

  output.publicPath = `http://localhost:${port + output.publicPath}`

  Object.keys(webpackConfig.entry).forEach(entryName => {
    const currentEntryPath = webpackConfig.entry[entryName]
    if (typeof currentEntryPath === 'string') {
      entry[entryName] = [hotMiddlewareScript, currentEntryPath]
    } else {
      currentEntryPath.unshift(hotMiddlewareScript)
    }
  })

  return {
    port,
    webpackConfig: Object.assign(webpackConfig, { output, entry })
  }
}

module.exports = class StaticWebpackServer {
  constructor (agent) {
    const config = normalizeConfig(agent.config.staticWebpack)
    const compiler = webpack(config.webpackConfig)
    Object.assign(this, { agent, config, compiler })
    this.middlerware()
  }

  middlerware () {
    const { compiler, agent, config: { webpackConfig } } = this

    const devServerOptions = {
      publicPath: webpackConfig.output.publicPath,
      stats: {
        colors: true,
        chunks: false
      }
    }

    const devMiddleware = require('koa-webpack-dev-middleware')(compiler, devServerOptions)
    const hotMiddleware = require('./koa-webpack-hot-middleware')(compiler)

    app.use(hotMiddleware)
    app.use(devMiddleware)

    agent.logger.info('> Starting dev server...')
    agent.__buildPromise = new Promise((resolve, reject) => {
      devMiddleware.waitUntilValid(() => {
        resolve()
      })
    })
  }

  start (callback) {
    const { config: { port }, agent } = this
    agent.__buildPromise.then(() => {
      app.listen(port, error => {
        callback(null)
        if (!error) agent.logger.info(`Listening at  http://localhost:${port} \n`)
      })
    })
  }
}
