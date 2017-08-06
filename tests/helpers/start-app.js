import { assign } from 'ember-platform';
import run from 'ember-runloop';
import Application from '../../app';
import config from '../../config/environment';
import keyboardRegisterTestHelpers from './ember-keyboard/register-test-helpers';
import './ticketfly-metrics-test-helper';

export default function startApp(attrs) {
  let application;
  const attributes = assign({}, config.APP, attrs);

  run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    keyboardRegisterTestHelpers();
    application.injectTestHelpers();
  });

  return application;
}
