'use strict';

const { expect } = require('code');
const Lab = require('lab');
const StandIn = require('stand-in');
const TsgClient = require('webconsole-cloudapi-client');
const { getServer } = require('./helpers');

const lab = exports.lab = Lab.script();
const { afterEach, describe, it } = lab;

describe('templates', () => {
  afterEach(() => {
    StandIn.restoreAll();
  });

  const template = {
    id: '29a08459-1a41-4ec9-bbb7-5c737f17a463',
    template_name: 'jolly-jelly',
    package: '14aba044-d0f8-11e5-8c88-eb339a5da5d0',
    image_id: '342045ce-6af1-4adf-9ef1-e5bfaf9de28c',
    firewall_enabled: false,
    networks: [
      '27ea1d5f-df02-410e-843a-c60dba9ec5ca'
    ],
    userdata: '',
    metadata: {
      'user-script': '#!/bin/bash\ndate\n'
    },
    tags: {
      owner: 'user'
    },
    created_at: '2018-04-15T20:24:07.481363Z'
  };

  it('can get all templates', async () => {
    StandIn.replaceOnce(TsgClient.prototype, 'fetch', (stand) => {
      return [template];
    });

    const server = await getServer();
    const res = await server.inject({
      url: '/graphql',
      method: 'post',
      payload: { query: 'query { templates { id name image tags { name } } }' }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.data.templates).to.exist();
    expect(res.result.data.templates[0].name).to.equal(template.template_name);
    expect(res.result.data.templates[0].image).to.equal(template.image_id);
    expect(res.result.data.templates[0].tags[0].name).to.equal(Object.keys(template.tags)[0]);
  });

  it('can get a single template', async () => {
    StandIn.replaceOnce(TsgClient.prototype, 'fetch', (stand) => {
      return template;
    });

    const server = await getServer();
    const res = await server.inject({
      url: '/graphql',
      method: 'post',
      payload: { query: `query { template(id: "${template.id}") { id name image tags { name } } }` }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.data.template).to.exist();
    expect(res.result.data.template.name).to.equal(template.template_name);
    expect(res.result.data.template.image).to.equal(template.image_id);
    expect(res.result.data.template.tags[0].name).to.equal(Object.keys(template.tags)[0]);
  });

  it('can create a template', async () => {
    StandIn.replaceOnce(TsgClient.prototype, 'fetch', (stand) => {
      return template;
    });

    const server = await getServer();
    const res = await server.inject({
      url: '/graphql',
      method: 'post',
      payload: { query: `mutation { createTemplate(
          name: "${template.name}"
          package: "${template.package}"
          image: "${template.image_id}"
        ) { id name image tags { name } } }` }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.data.createTemplate).to.exist();
    expect(res.result.data.createTemplate.name).to.equal(template.template_name);
    expect(res.result.data.createTemplate.image).to.equal(template.image_id);
    expect(res.result.data.createTemplate.tags[0].name).to.equal(Object.keys(template.tags)[0]);
  });

  it('can delete a template', async () => {
    StandIn.replace(TsgClient.prototype, 'fetch', (stand) => {
      return template;
    });

    const server = await getServer();
    const res = await server.inject({
      url: '/graphql',
      method: 'post',
      payload: { query: `mutation { deleteTemplate(id: "${template.id}") { id name image tags { name } } }` }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.data.deleteTemplate).to.exist();
    expect(res.result.data.deleteTemplate.name).to.equal(template.template_name);
    expect(res.result.data.deleteTemplate.image).to.equal(template.image_id);
    expect(res.result.data.deleteTemplate.tags[0].name).to.equal(Object.keys(template.tags)[0]);
  });
});
