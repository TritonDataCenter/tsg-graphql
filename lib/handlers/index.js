'use strict';

exports.groups = (fetch) => {
  return fetch('/groups');
};

exports.group = (fetch, { id }) => {
  return fetch(`/groups/${id}`);
};

exports.createGroup = (fetch, group) => {
  return fetch('/groups', { method: 'POST', payload: group });
};

exports.updateGroup = (fetch, group) => {
  return fetch(`/groups/${group.id}`, { method: 'PUT', payload: group });
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

exports.createTemplate = (fetch, template) => {
  return fetch('/templates', { method: 'POST', payload: template });
};

exports.deleteTemplate = async (fetch, { id }) => {
  const template = await fetch(`/templates/${id}`);
  await fetch(`/templates/${id}`, { method: 'DELETE' });
  return template;
};
