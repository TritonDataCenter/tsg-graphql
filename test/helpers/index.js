'use strict';

const Path = require('path');
const Hapi = require('hapi');
const TsgGql = require('../../lib/');
const Graphi = require('graphi');


exports.getServer = async (options = {}) => {
  const apiBaseUrl = options.apiBaseUrl || 'http://localhost';

  const server = new Hapi.Server();
  // const server = new Hapi.Server({ debug: { request: ['error'] } });
  server.auth.scheme('sso', () => {
    return {
      authenticate: (request, h) => {
        return h.authenticated({ credentials: { token: 'foo' } });
      }
    };
  });
  server.auth.strategy('sso', 'sso');

  const register = [
    {
      plugin: Graphi,
      options: {
        authStrategy: 'sso'
      }
    },
    {
      plugin: TsgGql,
      options: {
        keyPath: Path.join(__dirname, 'test.key'),
        keyId: 'test',
        apiBaseUrl
      }
    }
  ];

  await server.register(register);
  await server.initialize();

  return server;
};
