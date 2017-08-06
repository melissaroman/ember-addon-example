import checkRAF from '../utils/can-use-raf';
import Ember from 'ember';
import run, { scheduleOnce } from 'ember-runloop';
import RSVP from 'rsvp';

const { $, testing } = Ember;
const { Promise, resolve } = RSVP;
const { min, max } = Math;
const canUseRAF = checkRAF();
const { requestAnimationFrame } = window;

export default function(element, options) {
  if (!canUseRAF) {
    return resolve();
  }

  const $element = $(element);
  const { toColor, fromColor, event, duration = 200 } = options;
  const { offsetX, offsetY } = generateOffsets(event, $element.get(0));
  const makeGradient = generateGradientBuilder(offsetX, offsetY, fromColor, toColor);

  return animate(testing ? 0 : duration, (percentComplete) => {
    const gradient = makeGradient(ease(percentComplete));
    $element.css('background', gradient);
  }).then(() => {
    scheduleOnce('afterRender', () => {
      // Remove the gradient after the animation completes.
      $element.css('background', '');
    });
  });
}

function constrain(number, minVal = 0, maxVal = 1) {
  return min(max(minVal, number), maxVal);
}

function generateGradientBuilder(xOffset, yOffset, fromColor, toColor) {
  return (pct) => {
    const pctToFixed = (pct * 100).toFixed(2);
    return `radial-gradient(circle at ${xOffset}px ${yOffset}px, ${toColor} ${pctToFixed}%, ${fromColor} ${pctToFixed}%)`;
  };
}

function generateOffsets({ clientX = 0, clientY = 0 }, target) {
  const { left, top } = target.getBoundingClientRect();
  return {
    offsetX: clientX - left,
    offsetY: clientY - top
  };
}

function animate(duration, cb) {
  return new Promise((resolve) => {
    let animationStart;

    function step(timestamp) {
      if (!animationStart) {
        animationStart = timestamp;
      }

      const percentComplete = constrain((timestamp - animationStart) / duration);
      
      run(() => {
        cb(percentComplete);
      });

      if (percentComplete < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}

// Borrowed from: https://gist.github.com/gre/1650294
function ease(t) {
  return t*t*t;
}
