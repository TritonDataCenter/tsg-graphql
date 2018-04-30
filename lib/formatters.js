'use strict';

const Handlers = require('./handlers');
const Utils = require('./utils');


module.exports = {
  Group: {
    name: function ({ group_name }) {
      return group_name;
    },
    template: function ({ template_id }) {
      return Handlers.template(this.fetch, { id: template_id });
    },
    created: function ({ created_at }) {
      return created_at;
    },
    updated: function ({ updated_at }) {
      return updated_at;
    }
  },
  Template: {
    name: function ({ template_name }) {
      return template_name;
    },
    image: function ({ image_id }) {
      return image_id;
    },
    enableFirewall: function ({ firewall_enabled }) {
      return firewall_enabled;
    },
    metadata: function ({ metadata }) {
      return Utils.toNameValues(metadata);
    },
    tags: function ({ tags }) {
      return Utils.toNameValues(tags);
    },
    created: function ({ created_at }) {
      return created_at;
    }
  }
};
