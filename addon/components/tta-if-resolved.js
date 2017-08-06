import Component from 'ember-component';
import layout from '../templates/components/tta-if-resolved';
import { task } from 'ember-concurrency';
import get from 'ember-metal/get';

export default Component.extend({
  layout,
  tagName: '',

  resolveTask: task(function *() {
    return yield get(this, 'promise');
  }).keepLatest().on('didReceiveAttrs')
}).reopenClass({
  positionalParams: ['promise']
});
