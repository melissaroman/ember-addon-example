import Component from 'ember-component';
import layout from '../templates/components/tta-event-info';
import computed, { and } from 'ember-computed';
import get from 'ember-metal/get';

export default Component.extend({
  layout,
  classNames: ['flex', 'text-n7', 'margin-bottom-0'],
  hook: 'tta_event_table_info',
  hasImage: and('imageURL', 'media.isGreaterThanMobile'),

  imageURL: computed('event.imageUrls.{poster,card,banner}', {
    get() {
      const urls = get(this, 'event.imageUrls') || {};
      return get(urls, 'poster') || get(urls, 'card') || get(urls, 'banner');
    }
  })
});
