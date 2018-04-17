'use strict';

exports.groups = (fetch) => {
  return fetch('/groups');
};

exports.group = (fetch, { id }) => {
  return fetch(`/groups${id}`);
};

exports.createGroup = (fetch, group) => {
  return fetch('/groups', { method: 'POST' });
};

exports.updateGroup = (fetch, group) => {
  return fetch(`/groups/${group.id}`, { method: 'POST', payload: group });
};

exports.deleteGroup = (fetch, { id }) => {
  return fetch(`/groups${id}`, { method: 'DELETE' });
};
