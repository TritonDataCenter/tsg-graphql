'use strict';

const Path = require('path');
// const { expect } = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const TsgGql = require('../lib/');

const lab = exports.lab = Lab.script();
const it = lab.it;


const register = {
  plugin: TsgGql,
  options: {
    keyPath: Path.join(__dirname, 'test.key'),
    keyId: 'test',
    apiBaseUrl: 'http://localhost'
  }
};

it('can be registered with hapi', async () => {
  const server = new Hapi.Server();
  await server.register(register);
});
