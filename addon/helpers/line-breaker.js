import Ember from 'ember';

export function lineBreaker([text]) {
  const span = document.createElement('span');
  const segments = text.toString().split('\n');
  const lastSegment = segments.length - 1;

  segments.forEach((textSegment, index) => {
    if (textSegment) {
      span.appendChild(document.createTextNode(textSegment));
    }

    if (index < lastSegment) {
      span.appendChild(document.createElement('br'));
    }
  });

  return span;
}

export default Ember.Helper.helper(lineBreaker);
