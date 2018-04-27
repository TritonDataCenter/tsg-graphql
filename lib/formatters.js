'use strict';

module.exports = {
  Group: {
    instances: function ({ group_name }, args, request) {
      // need to change this.fetch to be the real cloudapi fetch instance
      return request.plugins.cloudapi.machines(this.fetch, { tags: [group_name] });
    }
  }
};
