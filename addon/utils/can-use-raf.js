// Adapted from `ember-in-viewport`
// https://github.com/DockYard/ember-in-viewport/blob/332e9b741435762b732f71ed102d85c267a6477f/addon/utils/can-use-raf.js
// Adapted from Paul Irish's rAF polyfill
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license
const vendors = [ 'ms', 'moz', 'webkit', 'o' ];

function checkRAF(window, rAF, cAF) {
  let x;
  
  for (x = 0; x < vendors.length && !window[rAF]; ++x) {
    window[rAF] = window[`${vendors[x]}RequestAnimationFrame`];
    window[cAF] = window[`${vendors[x]}CancelAnimationFrame`] ||
    window[`${vendors[x]}CancelRequestAnimationFrame`];
  }

  if (window[rAF] && window[cAF]) {
    return true;
  } else {
    return false;
  }
}

export default function canUseRAF() {
  return checkRAF(window, 'requestAnimationFrame', 'cancelAnimationFrame');
}
