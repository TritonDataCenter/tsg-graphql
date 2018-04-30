'use strict';

const Utils = require('../utils');


exports.groups = (fetch) => {
  return fetch('/groups');
};

exports.group = (fetch, { id }) => {
  return fetch(`/groups/${id}`);
};

exports.createGroup = (fetch, input) => {
  const payload = {
    group_name: input.name,
    template_id: input.template && input.template.id,
    capacity: input.capacity
  };

  return fetch('/groups', { method: 'POST', payload });
};

exports.updateGroup = (fetch, input) => {
  const payload = {
    id: input.id,
    group_name: input.name,
    template_id: input.template && input.template.id,
    capacity: input.capacity
  };

  return fetch(`/groups/${input.id}`, { method: 'PUT', payload });
};

exports.deleteGroup = (fetch, { id }) => {
  return fetch(`/groups/${id}`, { method: 'DELETE' });
};


exports.templates = (fetch) => {
  return fetch('/templates');
};

exports.template = (fetch, { id }) => {
  return fetch(`/templates/${id}`);
};

exports.createTemplate = (fetch, input) => {
  const payload = {
    template_name: input.name,
    package: input.package,
    image_id: input.image,
    firewall_enabled: input.enableFirewall,
    networks: input.networks,
    userdata: input.userdata,
    metadata: Utils.fromNameValues(input.metadata),
    tags: Utils.fromNameValues(input.tags)
  };

  return fetch('/templates', { method: 'POST', payload });
};

exports.deleteTemplate = async (fetch, { id }) => {
  const template = await fetch(`/templates/${id}`);
  await fetch(`/templates/${id}`, { method: 'DELETE' });
  return template;
};
