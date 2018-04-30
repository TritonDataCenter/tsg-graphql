'use strict';

const Assert = require('assert');
const Fs = require('fs');
const Path = require('path');
const TsgApi = require('webconsole-cloudapi-client');
const Formatters = require('./formatters');
const Package = require('../package.json');
const Routes = require('./routes');


const Schema = Fs.readFileSync(Path.join(__dirname, '/schema.graphql'));

const setupTsgApi = ({ keyId, key, apiBaseUrl }) => {
  return ({ auth, log }) => {
    return new TsgApi({
      token: auth.credentials && auth.credentials.token,
      url: apiBaseUrl,
      keyId,
      key,
      log,
      pathPrefix: '/v1/tsg/'
    });
  };
};

const preResolve = (tsgapi) => {
  return (root, args, request) => {
    if (request.route.settings.auth === false) {
      return;
    }

    return tsgapi({ auth: request.auth, log: request.log.bind(request) });
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

const register = (server, options = {}) => {
  Assert(options.apiBaseUrl, 'options.apiBaseUrl is required');
  Assert(options.keyId, 'options.keyId is required');
  Assert(options.keyPath, 'options.keyPath is required');

  server.dependency('graphi');

  const key = Fs.readFileSync(options.keyPath);
  const tsgapi = setupTsgApi({ key, ...options });

  server.decorate('handler', 'tsgGraphql', graphqlHandler);
  server.expose('options', options);
  server.route(Routes);

  const schema = server.makeExecutableSchema({
    schema: Schema.toString(),
    resolvers: Formatters,
    preResolve: preResolve(tsgapi)
  });

  server.registerSchema({ schema });

  server.ext({ type: 'onPostAuth', method: postAuth(tsgapi), options: { sandbox: 'plugin' } });
};

module.exports = {
  pkg: Package,
  register
};
