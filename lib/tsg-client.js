'use strict';

const Assert = require('assert');
const Crypto = require('crypto');
const QueryString = require('querystring');
const Bounce = require('bounce');
const Wreck = require('wreck');
const Boom = require('boom');


const emptySpan = {
  finish: () => {},
  log: () => {}
};

module.exports = class CloudApi {
  constructor ({ token, url, keyId, key, log, tracer } = {}) {
    const env = process.env.NODE_ENV;
    Assert(key, 'key is required');
    Assert(keyId, 'keyId is required');
    Assert(log, 'log is required');
    Assert(token || env === 'development' || env === 'test', 'token is required for production');

    this._token = token;
    this._keyId = keyId;
    this._key = key;
    this._wreck = Wreck.defaults({
      headers: this._authHeaders(),
      baseUrl: url,
      json: true
    });
    this._log = log.bind(this);
    this._tracer = tracer;  // optional, used to trace request spans
    this.fetch = this.fetch.bind(this);
  }

  _authHeaders () {
    const now = new Date().toUTCString();
    const signer = Crypto.createSign('sha256');
    signer.update(now);
    const signature = signer.sign(this._key, 'base64');

    const headers = {
      'Content-Type': 'application/json',
      'Accept-Version': '~8',
      Date: now,
      Authorization: `Signature keyId="${
        this._keyId
      }",algorithm="rsa-sha256" ${signature}`
    };

    if (this._token) {
      headers['X-Auth-Token'] = this._token;
    }

    return headers;
  }

  async _request (path = '/', options = {}) {
    const wreckOptions = {
      json: true,
      payload: options.payload,
      headers: options.headers
    };

    if (options.query) {
      path += `?${QueryString.stringify(options.query)}`;
    }

    const method = options.method ? options.method.toLowerCase() : 'get';

    const childOf = options.span ? options.span.context() : {};
    const span = this._tracer ? this._tracer.startSpan(`${method} ${path}`, { childOf }) : emptySpan;
    span.log({ event: 'request', wreckOptions }, Date.now());

    try {
      if (method.toLowerCase() === 'head') {
        const res = await this._wreck.request('head', path, wreckOptions);
        span.finish(Date.now());
        return { res, payload: {} };
      }

      const results = await this._wreck[method](path, wreckOptions);
      span.finish(Date.now());
      return results;
    } catch (ex) {
      const now = Date.now();
      this._log(['error', path], (ex.data && ex.data.payload) || ex);
      span.log({ event: 'error', ex }, now);
      span.finish(now);
      Bounce.rethrow(ex, 'system');

      if (options.default !== undefined) {
        return { payload: options.default, res: {} };
      }

      if (ex.data && ex.data.payload && ex.data.payload.message) {
        throw new Boom(ex.data.payload.message, ex.output.payload);
      }

      throw ex;
    }
  }

  async fetch (path = '/', options = {}) {
    const { payload, res } = await this._request(path, options);
    return options.includeRes ? { payload, res } : payload;
  }
};
