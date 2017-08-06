import Ember from 'ember';

export default function destroyApp(application) {
  Ember.run(application, 'destroy');
  Ember.$('.liquid-target-container').remove();
  server.shutdown();
}
