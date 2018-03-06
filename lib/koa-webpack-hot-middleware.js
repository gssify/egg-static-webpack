'use strict'

const webpackHotMiddleware = require('webpack-hot-middleware')

async function wrapMiddleware (next, req, res) {
  const { end: oldEnd } = res
  return new Promise(resolve => {
    res.end = function () {
      oldEnd.apply(this, arguments)
      resolve(0)
    }
    next(req, res, () => resolve(1))
  })
}

module.exports = (compiler, options) => {
  const expressMiddleware = webpackHotMiddleware(compiler, options)
  const koaMiddleware = async (ctx, next) => {
    const { req, res } = ctx
    const nextStep = await wrapMiddleware(expressMiddleware, req, res)
    if (nextStep && next) await next()
  }
  Object.keys(expressMiddleware).forEach(p => (koaMiddleware[p] = expressMiddleware[p]))
  return koaMiddleware
}
