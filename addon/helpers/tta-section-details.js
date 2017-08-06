import service from 'ember-service/inject';
import { assign } from 'ember-platform';
import { capitalize } from 'ember-string';
import { isEmpty } from 'ember-utils';
import get, { getProperties } from 'ember-metal/get';
import Helper from 'ember-helper';
import { htmlSafe } from 'ember-string';

const sectionKeys = ['section', 'row', 'seat'];

export function ttaSectionDetails([inlineHash], hash = {}, i18n) {
  const seatProperties = assign(getProperties(inlineHash || {}, sectionKeys), hash);

  function transformKey(key) {
    return i18n.t(`ticket.${key}`, { default: capitalize(key) });
  }

  const string = sectionKeys
    .filter((key) => !isEmpty(get(seatProperties, key)))
    .map((key) => `${transformKey(key)} ${get(seatProperties, key)}`)
    .join(' &#183; ');

  return string ? htmlSafe(string) : string;
}

export default Helper.extend({
  i18n: service(),

  compute() {
    return ttaSectionDetails(...arguments, get(this, 'i18n'));
  }
});
