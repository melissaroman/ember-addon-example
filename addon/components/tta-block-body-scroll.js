import Component from 'ember-component';
import Ember from 'ember';
import layout from '../templates/components/tta-block-body-scroll';

const { $ } = Ember;

export default Component.extend({
  layout,

  didInsertElement() {
    const $body = $('body');
    $body.css({ overflow: 'hidden' });
  },

  willDestroyElement() {
    const $body = $('body');
    $body.css({ overflow: '' });
  }
});
