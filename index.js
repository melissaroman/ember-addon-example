/* eslint-env node */
const EngineAddon = require('ember-engines/lib/engine-addon');
const stew = require('broccoli-stew');
const MergeTrees = require('broccoli-merge-trees');

module.exports = EngineAddon.extend({
  name: 'ticket-transfer-addon',
  lazyLoading: false,

  mirageConfig: null,

  included(app) {
    this.mirageConfig = this.app.project.config(app.env)['ember-cli-mirage'] || {};
    return this._super.apply(this, arguments);
  },

  postprocessTree(type, tree) {
    if (type === 'js' && !this.mirageConfig.enabled) {
      return stew.rm(tree, '*/mirage/**/*', '**/ember-cli-mirage.js');
    }
    return tree;
  },

  treeForPublic(tree) {
    return new MergeTrees(['public', tree], {
      overwrite: true,
      annotation: '`ticket-transfer-addon` public tree'
    });
  }
});
