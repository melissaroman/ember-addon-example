import Component from 'ember-component';
import computed, { reads } from 'ember-computed';
import Ember from 'ember';
import get from 'ember-metal/get';
import layout from '../templates/components/tta-ticket-row';
import { tryInvoke } from 'ember-utils';
import { task, timeout } from 'ember-concurrency';
import backgroundRipple from 'ticket-transfer-addon/transitions/background-ripple';

const BLUE = 'rgba(30, 177, 255, 0.1)';
const WHITE = 'white';
const { testing } = Ember;

export default Component.extend({
  layout,
  classNameBindings: ['selected:background-b5-10', 'transferable:pointer'],
  hook: 'tta_ticket_row',
  tagName: 'li',
  hookQualifiers: computed('selected', {
    get() {
      return {
        selected: get(this, 'selected')
      };
    }
  }).readOnly(),

  animateBackground: task(function *(event) {
    yield timeout(0);
    const element = get(this, 'element');
    const selected = get(this, 'selected');
    const fromColor = selected ? BLUE : WHITE;
    const toColor = selected ? WHITE : BLUE;
    yield backgroundRipple(element, { event, toColor, fromColor });
  }).enqueue(),

  ticket: {},
  transferable: reads('ticket.transferState.transferable'),

  click(event) {
    if (get(this, 'transferable')) {
      if (testing) {
        tryInvoke(this, 'toggleSelect');
      } else {
        get(this, 'animateBackground').perform(event).then(() => {
          tryInvoke(this, 'toggleSelect');
        });
      }
    }
  }
});
