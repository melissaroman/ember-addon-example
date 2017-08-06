import Ember from 'ember';
import moment from 'moment';
import { test } from 'ember-qunit';
import { moduleForComponent } from 'dummy/tests/helpers/test-module-for-engine';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';
import { setBreakpointForIntegrationTest } from '../../../tests/helpers/responsive';

moduleForComponent('tta-event-info', 'Integration | Component | tta event info', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('`tta-event-info` renders the event img in order of priority', function(assert) {
  setBreakpointForIntegrationTest(this, 'greaterThanMobile');
  assert.expect(4);

  this.set('event', {
    imageUrls: {
      poster: '/foo/poster.png',
      card: '/foo/card.png',
      banner: '/foo/banner.png'
    }
  });

  this.render(hbs`{{tta-event-info event=event media=media}}`);

  assert.equal(this.$(hook('tta_event_table_img')).length, 1, 'there is an image rendered');
  assert.equal(this.$(hook('tta_event_table_img')).attr('src'), '/foo/poster.png', 'correct src');

  this.set('event.imageUrls.poster', '');

  assert.equal(this.$(hook('tta_event_table_img')).attr('src'), '/foo/card.png', 'correct src');

  this.set('event.imageUrls.card', '');

  assert.equal(this.$(hook('tta_event_table_img')).attr('src'), '/foo/banner.png', 'correct src');
});

test('`tta-event-info` does not render the image if on mobile', function(assert) {
  setBreakpointForIntegrationTest(this, 'mobile');
  assert.expect(1);

  this.set('event', {
    imageUrls: {
      poster: '/foo/poster.png',
      card: '/foo/card.png',
      banner: '/foo/banner.png'
    }
  });

  this.render(hbs`{{tta-event-info event=event media=media}}`);

  assert.equal(this.$(hook('tta_event_table_img')).length, 0, 'there is no image rendered');
});

test('`tta-event-info` renders the event name', function(assert) {
  assert.expect(2);

  this.set('event', Ember.Object.create({
    name: 'Beruit'
  }));

  this.render(hbs`{{tta-event-info event=event}}`);

  const tableName = this.$(hook('tta_event_table_name'));
  assert.equal(tableName.text().trim(), 'Beruit', 'correct text');
  assert.ok(tableName.hasClass('text-large-6-1'), 'larger text if no `topLineInfo`');
});

test('`tta-event-info` renders the top line info', function(assert) {
  assert.expect(2);

  this.set('event', Ember.Object.create({
    name: 'Beruit',
    topLineInfo: 'Hamilton presents'
  }));

  this.render(hbs`{{tta-event-info event=event}}`);

  const topLine = this.$(hook('tta_event_table_top_line'));
  const tableName = this.$(hook('tta_event_table_name'));
  assert.equal(topLine.text().trim(), 'Hamilton presents', 'correct text');
  assert.ok(tableName.hasClass('text-large-2'), 'smaller text if `topLineInfo`');
});

test('`tta-event-info` renders the event date', function(assert) {
  assert.expect(1);

  this.set('event', Ember.Object.create({
    startTime: moment('2000-01-05 21:50:00')
  }));

  this.render(hbs`{{tta-event-info event=event}}`);

  assert.equal(this.$(hook('tta_event_table_date')).text().trim(), 'Wednesday, January 5, 2000', 'correct text');
});

test('`tta-event-info` renders the event door and start times', function(assert) {
  assert.expect(3);

  this.set('event', Ember.Object.create({
    doorTime: moment('2000-01-05 21:50:00'),
    startTime: moment('2000-01-05 22:50:00')
  }));

  this.render(hbs`{{tta-event-info event=event}}`);

  assert.equal(this.$(hook('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Doors 9:50 PM | Show 10:50 PM', 'correct text');

  this.set('event', Ember.Object.create({
    doorTime: null,
    startTime: moment('2000-01-05 22:50:00')
  }));

  assert.equal(this.$(hook('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Show 10:50 PM', 'correct text');

  this.set('event', Ember.Object.create({
    doorTime: moment('2000-01-05 22:50:00'),
    startTime: null
  }));

  assert.equal(this.$(hook('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Doors 10:50 PM', 'correct text');
});

test('`tta-event-info` renders the event location', function(assert) {
  assert.expect(1);

  this.set('event', Ember.Object.create({
    venue: {
      name: 'Bar',
      address: {
        city: 'Foo',
        stateCode: 'BZ'
      }
    }
  }));

  this.render(hbs`{{tta-event-info event=event}}`);

  assert.equal(this.$(hook('tta_event_table_location')).text().trim(), 'Bar, Foo, BZ', 'correct text');
});
