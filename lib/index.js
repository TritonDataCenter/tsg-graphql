'use strict';

const Assert = require('assert');
const Fs = require('fs');
const Url = require('url');
const Path = require('path');
const Graphi = require('graphi');
const Package = require('../package.json');
const TsgApi = require('webconsole-cloudapi-client');
const Routes = require('./routes');


const Schema = Fs.readFileSync(Path.join(__dirname, '/schema.graphql'));

const setupTsgApi = ({ keyId, key, apiBaseUrl }) => {
  return ({ auth, log }) => {
    return new TsgApi({
      token: auth.credentials && auth.credentials.token,
      url: apiBaseUrl,
      keyId,
      key,
      log
    });
  };
};

const postAuth = (tsgapi) => {
  return (request, h) => {
    if (request.route.settings.auth === false) {
      return h.continue;
    }

    request.plugins.tsgapi = tsgapi({ auth: request.auth, log: request.log.bind(request) });

    return h.continue;
  };
};

const graphqlHandler = function (route, options) {
  Assert(typeof options.method === 'function', 'method must be a function');

  return function (request, h) {
    const fetch = request.plugins.tsgapi.fetch.bind(request.plugins.tsgapi);
    return options.method(fetch, request.payload, request);
  };
};

const register = async (server, options = {}) => {
  Assert(options.apiBaseUrl, 'options.apiBaseUrl is required');
  Assert(options.keyId, 'options.keyId is required');
  Assert(options.keyPath, 'options.keyPath is required');

  const key = Fs.readFileSync(options.keyPath);
  options.dcName = options.dcName || Url.parse(options.apiBaseUrl).host.split('.')[0];

  const tsgapi = setupTsgApi({ key, ...options });

  server.decorate('handler', 'graphql', graphqlHandler);
  server.expose('options', options);
  server.route(Routes);

  const graphiOptions = {
    graphiqlPath: process.env.NODE_ENV === 'development' ? '/graphiql' : options.graphiqlPath,
    schema: Schema.toString(),
    authStrategy: options.authStrategy
  };

  await server.register({ plugin: Graphi, options: graphiOptions });

  server.ext({ type: 'onPostAuth', method: postAuth(tsgapi), options: { sandbox: 'plugin' } });
};

module.exports = {
  pkg: Package,
  register
};
