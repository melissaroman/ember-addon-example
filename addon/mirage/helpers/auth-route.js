import { Response } from 'ember-cli-mirage';

export default function(cb) {
  return function(schema, request) {
    const { requestHeaders: { Authorization: token } } = request;

    if (!token) {
      return new Response('403', {}, { error: 'No Bearer token.' });
    }

    // Add the token as a param.
    request.params.authToken = token.replace('Bearer ', '');

    return cb.call(this, schema, request);
  };
}
