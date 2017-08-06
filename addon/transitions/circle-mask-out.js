import { stop } from "liquid-fire";
import { calculateBounds, makeMaskContainer, animateMask } from './circle-mask-utils';

export default function (targetSelector, opts = {}) {
  const { newElement, oldElement } = this;

  stop(oldElement);
  const dimensions = calculateBounds(oldElement, newElement, targetSelector);

  newElement.css({ visibility: '' });

  const maskContainer = makeMaskContainer(newElement, false, {
    position: 'absolute',
    overflow: 'hidden',
    height: 0,
    width: 0,
    borderRadius: '100%'
  });

  return animateMask(maskContainer, false, opts, dimensions);
}
