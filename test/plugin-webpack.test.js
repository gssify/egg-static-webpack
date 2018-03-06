'use strict';

const mock = require('egg-mock');

describe('test/plugin-webpack.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/plugin-webpack-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, pluginWebpack')
      .expect(200);
  });
});
