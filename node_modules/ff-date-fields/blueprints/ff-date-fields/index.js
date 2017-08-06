var fs = require('fs');
var path = require('path');

module.exports = {
  description: 'install moment',
  normalizeEntityName: function() {},

  afterInstall: function () {
    return this.addAddonToProject({ name: 'ember-moment', target: '7.0.0-beta.3' });
  }
};
