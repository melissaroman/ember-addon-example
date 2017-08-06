import { copy } from 'ember-metal/utils';
import { assign } from 'ember-platform';

class Options {
  constructor(defaults, options) {
    this._options = assign(copy(defaults), options);
  }

  get(key, ...args) {
    const maybeCB = this._options[key];
    return typeof maybeCB === 'function' ? maybeCB(...args) : copy(maybeCB);
  }
}

export default function(defaults, cb) {
  return function(server, options = {}) {
    const OPTS = new Options(defaults, options);
    return cb(server, OPTS);
  }
}
