import { helper } from 'ember-helper';

export function ttaInc([value, step = 1]) {
  return value + step;
}

export default helper(ttaInc);
