import { stop, Promise, animate } from "liquid-fire";
import Ember from 'ember';
import { calculateBounds, makeMaskContainer, animateMask } from './circle-mask-utils';
const { $: { Velocity } } = Ember;

export default function (targetSelector, opts = {}) {
  const { oldElement, newElement } = this;

  stop(oldElement);
  const dimensions = calculateBounds(newElement, oldElement, targetSelector);

  newElement.css({
    visibility: '',
    opacity: 0
  });

  const maskContainer = makeMaskContainer(oldElement, true, {
    position: 'absolute',
    overflow: 'hidden',
    width: dimensions.outerRadius * 2,
    height: dimensions.outerRadius * 2
  });

  const duration = 'duration' in opts ? opts.duration : Velocity.defaults.duration;
  const fadeDelay = duration * 0.6;
  const fadeDuration = duration * 0.4;

  return Promise.all([
    animateMask(maskContainer, true, opts, dimensions),
    animate(newElement, {
      opacity: [1, 0]
    }, {
      delay: fadeDelay,
      duration: fadeDuration,
      easing: 'linear'
    })
  ]);
}

