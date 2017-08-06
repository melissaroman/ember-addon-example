import Component from 'ember-component';
import layout from '../templates/components/tta-modal';
import { EKMixin, keyPress } from 'ember-keyboard';
import { tryInvoke } from 'ember-utils';
import on from 'ember-evented/on';

export default Component.extend(EKMixin, {
  layout,
  keyboardActivated: true,
  keyboardPriority: 10,
  hook: 'tta_modal',

  triggerClose: on(keyPress('Escape'), function() {
    tryInvoke(this, 'on-close');
  })
});
