'use strict';

define('dummy/tests/acceptance/accept-flow-test', ['qunit', 'ember-hook', 'dummy/tests/helpers/module-for-acceptance', 'ticket-transfer-addon/mirage/scenarios/create-transfer', 'dummy/tests/helpers/ember-simple-auth'], function (_qunit, _emberHook, _moduleForAcceptance, _createTransfer16, _emberSimpleAuth) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  (0, _moduleForAcceptance.default)('Acceptance | accept flow', {});

  (0, _qunit.test)('can accept tickets and it tracks the actions', function (assert) {
    var user = server.create('user');

    var _createTransfer = (0, _createTransfer16.default)(server),
        transfer = _createTransfer.transfer,
        _createTransfer$event = _slicedToArray(_createTransfer.events, 1),
        event = _createTransfer$event[0],
        acceptanceToken = _createTransfer.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(find((0, _emberHook.$hook)('tta_same_user_warning')).length, 0, 'the same user warning is not visible in this case');
      assert.ok(!server.db.marketingMemberships.length, 'there are no marketing memberships');
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
      click((0, _emberHook.$hook)('tta_accept_button'));

      var trackPage = queryMetrics('trackPage');
      var first = trackPage.first;


      assert.equal(trackPage.length, 1, 'this page visit was tracked');
      assert.equal(first.eventName, event.name, 'we tracked the event name');
      assert.equal(first.eventId, event.id, 'we tracked the event id');
      assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
      assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');

      var aliasUser = queryMetrics('alias');

      assert.equal(aliasUser.length, 1, 'the alias user metrics was created');
      assert.deepEqual(aliasUser.first, { alias: user.id }, 'alias was sent with user id');

      var identifyUser = queryMetrics('identify');

      assert.equal(identifyUser.length, 1, 'the alias user metrics was created');
      assert.deepEqual(identifyUser.first, {
        distinctId: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      }, 'alias was sent with user id');
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/success' + queryString);

      var updatedTransfer = server.schema.ticketTransfers.find(transfer.id);
      var length = updatedTransfer.ticketIds.length;

      assert.equal(updatedTransfer.status, 'COMPLETED', 'the transfer was accepted');
      assert.equal(length, 4, 'all four tickets were accepted');
      assert.equal((0, _emberHook.$hook)('tta_accept_header_text').text().trim(), transfer.senderFirstName + ' sent you tickets.');
      assert.equal((0, _emberHook.$hook)('tta_accept_success_message').text().trim(), 'Tickets accepted!', 'there is a success message');
      assert.ok(server.db.marketingMemberships.length, 'a marketing memberships was created and saved');

      var _queryMetrics = queryMetrics('trackEvent'),
          first = _queryMetrics.first;

      assert.deepEqual(first, {
        event: 'transfer acceptance',
        isProbablyNewUser: false,
        transferId: transfer.id,
        marketingPreferenceOptIn: true,
        newOptInToOrg: false,
        changedMarketingPreference: false,
        numberOfTicketsAccepted: length
      }, 'the transfer acceptance event metric was sent');
    });
  });

  (0, _qunit.test)('cannot directly navigate to success screen', function (assert) {
    var user = server.create('user');

    var _createTransfer2 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer2.transfer,
        acceptanceToken = _createTransfer2.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + '/success' + queryString);

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
    });
  });

  (0, _qunit.test)('the promotions checkbox will default to checked if it has a truthy marketing preference', function (assert) {
    var user = server.create('user');

    var _createTransfer3 = (0, _createTransfer16.default)(server, {
      createMarketingPreference: true,
      marketingPreferenceConfig: {
        emailSubscription: true,
        userId: user.id
      }
    }),
        transfer = _createTransfer3.transfer,
        acceptanceToken = _createTransfer3.transfer.acceptanceToken,
        _createTransfer3$mark = _slicedToArray(_createTransfer3.marketingMemberships, 1),
        pref = _createTransfer3$mark[0];

    var queryString = '?acceptanceToken=' + acceptanceToken;
    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
      assert.ok((0, _emberHook.$hook)('tta_accept_promotions').find('input').is(':checked'), 'the checkbox is checked');

      click((0, _emberHook.$hook)('tta_accept_promotions').find('input'));
      click((0, _emberHook.$hook)('tta_accept_button'));
    });

    andThen(function () {
      var updatedPref = server.db.marketingMemberships.find(pref.id);
      assert.equal(updatedPref.emailSubscription, false, 'the marketing preference was updated');

      var _queryMetrics2 = queryMetrics('trackEvent'),
          first = _queryMetrics2.first;

      assert.equal(first.marketingPreferenceOptIn, false, 'opt in event was false');
      assert.equal(first.changedMarketingPreference, true, 'opt in event was changed');
      assert.equal(first.newOptInToOrg, false, 'is new opt in to org');
    });
  });

  (0, _qunit.test)('the promotions checkbox will default to unchecked if it has a falsey marketing preference', function (assert) {
    var user = server.create('user');

    var _createTransfer4 = (0, _createTransfer16.default)(server, {
      createMarketingPreference: true,
      marketingPreferenceConfig: {
        emailSubscription: false,
        userId: user.id
      }
    }),
        transfer = _createTransfer4.transfer,
        acceptanceToken = _createTransfer4.transfer.acceptanceToken,
        _createTransfer4$mark = _slicedToArray(_createTransfer4.marketingMemberships, 1),
        pref = _createTransfer4$mark[0];

    var queryString = '?acceptanceToken=' + acceptanceToken;
    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
      assert.ok(!(0, _emberHook.$hook)('tta_accept_promotions').find('input').is(':checked'), 'the checkbox is not checked');

      click((0, _emberHook.$hook)('tta_accept_promotions').find('input'));
      click((0, _emberHook.$hook)('tta_accept_button'));
    });

    andThen(function () {
      var updatedPref = server.db.marketingMemberships.find(pref.id);
      assert.equal(updatedPref.emailSubscription, true, 'the marketing preference was updated');

      var _queryMetrics3 = queryMetrics('trackEvent'),
          first = _queryMetrics3.first;

      assert.equal(first.marketingPreferenceOptIn, true, 'opt in event was false');
      assert.equal(first.changedMarketingPreference, true, 'opt in event was changed');
      assert.equal(first.newOptInToOrg, true, 'is new opt in to org');
    });
  });

  (0, _qunit.test)('is redirected to login screen if accepting, but not logged in', function (assert) {
    var _this = this;

    var user = server.create('user');

    var _createTransfer5 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer5.transfer,
        acceptanceToken = _createTransfer5.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(currentURL(), '/test-login');
      authenticate(_this.application, user);
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString, 'after logging in, we are taken back to accept');
    });
  });

  (0, _qunit.test)('can show error on unsuccessful accept', function (assert) {
    var user = server.create('user');

    var _createTransfer6 = (0, _createTransfer16.default)(server, {
      transferTraits: ['errorsOnTransfer']
    }),
        transfer = _createTransfer6.transfer,
        acceptanceToken = _createTransfer6.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
      click((0, _emberHook.$hook)('tta_accept_button'));
    });

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_toast').text().trim(), 'We are unable to complete your request. Please try again later.', 'there is an error toast');
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);

      var _queryMetrics4 = queryMetrics('trackEvent'),
          first = _queryMetrics4.first;

      assert.equal(first.event, 'error on transfer acceptance', 'the error tracking event was sent');
      assert.ok(first.error.indexOf('Error: Assertion Failed: `AdapterError` expects json-api formatted errors array.') > -1, 'the error message was also send');
    });
  });

  (0, _qunit.test)('cancelled transfer state is displayed properly', function (assert) {
    var user = server.create('user');

    var _createTransfer7 = (0, _createTransfer16.default)(server, {
      transferTraits: ['cancelledStatus']
    }),
        transfer = _createTransfer7.transfer,
        acceptanceToken = _createTransfer7.transfer.acceptanceToken;

    authenticate(this.application, user);

    var queryString = '?acceptanceToken=' + acceptanceToken;

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_accept_header_text').text().trim(), 'Ticket transfer cancelled.');
      assert.equal((0, _emberHook.$hook)('tta_accept_complete_ticket_row_status').eq(0).text().trim(), 'Cancelled');
    });
  });

  (0, _qunit.test)('declined transfer state is displayed properly', function (assert) {
    var user = server.create('user');

    var _createTransfer8 = (0, _createTransfer16.default)(server, {
      transferTraits: ['deniedStatus']
    }),
        transfer = _createTransfer8.transfer,
        acceptanceToken = _createTransfer8.transfer.acceptanceToken;

    authenticate(this.application, user);

    var queryString = '?acceptanceToken=' + acceptanceToken;

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_accept_header_text').text().trim(), 'Ticket transfer declined.');
      assert.equal((0, _emberHook.$hook)('tta_accept_complete_ticket_row_status').eq(0).text().trim(), 'Declined');
    });
  });

  (0, _qunit.test)('already accepted transfer state is displayed properly', function (assert) {
    var user = server.create('user');

    var _createTransfer9 = (0, _createTransfer16.default)(server, {
      transferTraits: ['acceptedStatus']
    }),
        transfer = _createTransfer9.transfer,
        acceptanceToken = _createTransfer9.transfer.acceptanceToken;

    authenticate(this.application, user);

    var queryString = '?acceptanceToken=' + acceptanceToken;

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_accept_header_text').text().trim(), 'You can no longer accept this transfer because it has already been accepted.', 'message regarding tickets already having been accepted');
    });
  });

  (0, _qunit.test)('not acceptable acceptanceState is displayed properly', function (assert) {
    var user = server.create('user');

    var _createTransfer10 = (0, _createTransfer16.default)(server, {
      transferTraits: ['notAcceptableStatus']
    }),
        transfer = _createTransfer10.transfer,
        acceptanceToken = _createTransfer10.transfer.acceptanceToken;

    authenticate(this.application, user);

    var queryString = '?acceptanceToken=' + acceptanceToken;

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_accept_header_text').text().trim().replace(/[\s\n]+/g, ' '), 'You can no longer accept this transfer. Status: Invalid / Scanned', 'message regarding tickets acceptance status');
    });
  });

  (0, _qunit.test)('user is prompted to enter first name / last name if no existing first name / last name is found', function (assert) {
    var user = server.create('user', {
      firstName: '',
      lastName: ''
    });

    var _createTransfer11 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer11.transfer,
        acceptanceToken = _createTransfer11.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    var prevUrl = void 0;
    andThen(function () {
      prevUrl = currentURL();
      fillIn((0, _emberHook.$hook)('tta_validating_input').eq(0), 'Spencer');
      keyEvent((0, _emberHook.$hook)('tta_validating_input').eq(0), 'keyup');
      click((0, _emberHook.$hook)('tta_accept_button'));
    });

    andThen(function () {
      assert.equal(prevUrl, currentURL(), 'the accept click was blocked due to invalid name');
      fillIn((0, _emberHook.$hook)('tta_validating_input').eq(1), 'Price');
      keyEvent((0, _emberHook.$hook)('tta_validating_input').eq(1), 'keyup');
    });

    andThen(function () {
      click((0, _emberHook.$hook)('tta_accept_button'));
    });

    andThen(function () {
      var dbUser = server.db.users.find(user.id);

      assert.notEqual(prevUrl, currentURL(), 'with a valid name, we have proceeded');
      assert.equal(dbUser.firstName, 'Spencer');
      assert.equal(dbUser.lastName, 'Price');

      var identifyUser = queryMetrics('identify');

      assert.deepEqual(identifyUser.first, {
        distinctId: user.id,
        firstName: '',
        lastName: ''
      }, 'the original identify did not include names');

      assert.deepEqual(identifyUser.last, {
        distinctId: user.id,
        firstName: 'Spencer',
        lastName: 'Price'
      }, 'the subsequent identify did include names');

      var _queryMetrics5 = queryMetrics('trackEvent'),
          isProbablyNewUser = _queryMetrics5.first.isProbablyNewUser;

      assert.ok(isProbablyNewUser, 'metrics track this as `probablyANewUser`');
    });
  });

  (0, _qunit.test)('user is not prompted to enter first name / last name if existing first name / last name is found', function (assert) {
    var user = server.create('user', {
      firstName: 'Spencer',
      lastName: 'Price'
    });

    var _createTransfer12 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer12.transfer,
        acceptanceToken = _createTransfer12.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(find((0, _emberHook.$hook)('tta_validating_input').eq(0)).length, 0);
      assert.equal(find((0, _emberHook.$hook)('tta_validating_input').eq(1)).length, 0);
    });

    andThen(function () {
      var dbUser = server.db.users.find(user.id);

      assert.equal(dbUser.firstName, 'Spencer');
      assert.equal(dbUser.lastName, 'Price');
    });
  });

  (0, _qunit.test)('if user has either a first or last name, but not both, inputs are displayed and contain name', function (assert) {
    var user = server.create('user', {
      firstName: 'Spencer',
      lastName: ''
    });

    var _createTransfer13 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer13.transfer,
        acceptanceToken = _createTransfer13.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(find((0, _emberHook.$hook)('tta_validating_input').eq(0)).val(), 'Spencer');
      assert.equal(find((0, _emberHook.$hook)('tta_validating_input').eq(1)).val(), '');
    });
  });

  (0, _qunit.test)('can view and leave the terms and conditions', function (assert) {
    var user = server.create('user');

    var _createTransfer14 = (0, _createTransfer16.default)(server),
        transfer = _createTransfer14.transfer,
        acceptanceToken = _createTransfer14.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      click((0, _emberHook.$hook)('tta_accept_tandc'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm/terms' + queryString);

      click((0, _emberHook.$hook)('tta_accept_tandc_back'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);

      click((0, _emberHook.$hook)('tta_accept_tandc'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm/terms' + queryString);

      keyPress('Escape');
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/accept/' + transfer.id + '/confirm' + queryString);
    });
  });

  (0, _qunit.test)('an alert is shown if the user is accepting to itself', function (assert) {
    var user = server.create('user');

    var _createTransfer15 = (0, _createTransfer16.default)(server, {
      transferConfig: {
        senderEmail: user.email
      }
    }),
        transfer = _createTransfer15.transfer,
        acceptanceToken = _createTransfer15.transfer.acceptanceToken;

    var queryString = '?acceptanceToken=' + acceptanceToken;

    authenticate(this.application, user);

    visit('/transfers/accept/' + transfer.id + queryString);

    andThen(function () {
      assert.equal(find((0, _emberHook.$hook)('tta_same_user_warning')).length, 1);
    });
  });

  function authenticate(application, user) {
    var session = (0, _emberSimpleAuth.currentSession)(application);

    return (0, _emberSimpleAuth.authenticateSession)(application, {
      access_token: user._authToken
    }).then(function () {
      // This simulates some of Simple Auth's Behavior.
      var transition = session.get('attemptedTransition');
      if (transition) {
        transition.retry();
      }
    });
  }
});
define('dummy/tests/acceptance/tta-flow-test', ['qunit', 'dummy/tests/helpers/module-for-acceptance', 'ember-hook', 'ticket-transfer-addon/mirage/scenarios/create-order', 'dummy/tests/helpers/ember-simple-auth'], function (_qunit, _moduleForAcceptance, _emberHook, _createOrder8, _emberSimpleAuth) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var accessToken = '1234';

  (0, _moduleForAcceptance.default)('Acceptance | tta flow', {
    beforeEach: function beforeEach() {
      this.user = server.create('user', {
        _authToken: accessToken
      });

      return (0, _emberSimpleAuth.authenticateSession)(this.application, {
        access_token: accessToken
      });
    }
  });

  (0, _qunit.test)('can escape ticket transfer app', function (assert) {
    assert.expect(3);

    var _createOrder = (0, _createOrder8.default)(server),
        _createOrder$tickets = _slicedToArray(_createOrder.tickets, 1),
        orderId = _createOrder$tickets[0].orderId,
        _createOrder$events = _slicedToArray(_createOrder.events, 1),
        eventId = _createOrder$events[0].id;

    visit('/transfers/new/' + orderId + '/' + eventId);

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'routes are injected');
      assert.equal((0, _emberHook.$hook)('tta_title').text().trim(), 'Transfer Tickets', 'page rendered correctly');

      click((0, _emberHook.$hook)('tta_close_transfer_app'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/', 'transfer app closed');
    });
  });

  (0, _qunit.test)('can select tickets to transfer and successfully transfer them and track the events', function (assert) {
    var _this = this;

    setBreakpoint('greaterThanMobile');
    var orderId = '1';

    var _createOrder2 = (0, _createOrder8.default)(server, {
      ticketsPerEvent: 4,
      ticketConfig: {
        orderId: '1',
        userId: this.user.id
      }
    }),
        tickets = _createOrder2.tickets,
        _createOrder2$events = _slicedToArray(_createOrder2.events, 1),
        event = _createOrder2$events[0];

    visit('/transfers/new/' + orderId + '/' + event.id);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, tickets.length, 'and all have checkboxes');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox', { checked: true }).length, 0, 'but none are checked');
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: false }).length, 'the transfer button is disabled');

      var trackPage = queryMetrics('trackPage');
      var first = trackPage.first;


      assert.equal(trackPage.length, 1, 'this page visit was tracked');
      assert.equal(first.eventName, event.name, 'we tracked the event name');
      assert.equal(first.eventId, event.id, 'we tracked the event id');
      assert.equal(first.orgId, event.organizationId, 'we tracked the orgId');
      assert.equal(first.orgName, event.organizationName, 'we tracked the orgName');

      var aliasUser = queryMetrics('alias');
      var user = _this.user;


      assert.equal(aliasUser.length, 1, 'the alias user metrics was created');
      assert.deepEqual(aliasUser.first, { alias: user.id }, 'alias was sent with user id');

      var identifyUser = queryMetrics('identify');

      assert.equal(identifyUser.length, 1, 'the alias user metrics was created');
      assert.deepEqual(identifyUser.first, {
        distinctId: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      }, 'alias was sent with user id');
    });

    andThen(function () {
      click((0, _emberHook.$hook)('tta_ticket_row').eq(0));
      click((0, _emberHook.$hook)('tta_ticket_row').eq(1));
    });

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox', { checked: true }).length, 2, 'two are checked');
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled');
    });

    andThen(function () {
      fillIn((0, _emberHook.$hook)('tta_validating_input'), _this.user.email);
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled since attempting to transfer to self');
      assert.equal((0, _emberHook.$hook)('tta_validating_input_error').text().trim(), 'You cannot transfer these tickets to yourself.');

      fillIn((0, _emberHook.$hook)('tta_validating_input'), 'spencer.price@ticketfly.com');
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: true }).length, 'the transfer button is enabled');

      // Add a message
      click((0, _emberHook.$hook)('tta_personal_message_add'));
    });

    andThen(function () {
      var input = (0, _emberHook.$hook)('tta_personal_message_input');
      fillIn(input, 'Enjoy the show!');
      keyEvent(input, 'keyup');
      triggerEvent(input, 'blur');
    });

    andThen(function () {
      click((0, _emberHook.$hook)('tta_transfer_button'));
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_confirmation_modal').length, 'the confirmation modal is visible');
      keyPress('Escape');
    });

    andThen(function () {
      assert.ok(!(0, _emberHook.$hook)('tta_confirmation_modal').length, 'the confirmation modal is hidden after an escape press');
      click((0, _emberHook.$hook)('tta_transfer_button'));
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_confirmation_modal').length, 'the confirmation modal is visible');
      assert.equal((0, _emberHook.$hook)('tta_grouped_tickets_ticket').length, 2, '2 tickets are being confirmed');
      assert.equal((0, _emberHook.$hook)('tta_confirmation_modal_email').text().trim(), 'spencer.price@ticketfly.com', 'confirm email is visible');

      // Visit the Terms and Conditions
      click((0, _emberHook.$hook)('tta_confirmation_modal_tandc'));
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_confirmation_modal_tandc_text').length, 'the terms text is visible');
      click((0, _emberHook.$hook)('tta_confirmation_modal_tandc_back'));
    });

    andThen(function () {
      click((0, _emberHook.$hook)('tta_confirmation_modal_transfer_button'));
    });

    andThen(function () {
      // TODO: When testing for ember-concurrency gets better, we can add an assert that the Succeess Modal
      // shows up for a period of time.
      click((0, _emberHook.$hook)('tta_confirmation_success_done'));
    });

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_confirmation_modal').length, 0, 'the confirmation modal is hidden again');

      assert.equal((0, _emberHook.$hook)('tta_ticket_row_transfer_status').length, 2, 'two tickets show transferred status');
      assert.ok((0, _emberHook.$hook)('tta_ticket_row_transfer_status').eq(0).text().indexOf('spencer.price@ticketfly.com') > -1, 'the email is visible too');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, tickets.length - 2, 'the remaining have checkboxes');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row', { selected: false }).length, tickets.length, 'all tickets should be deselected');
      assert.equal((0, _emberHook.$hook)('tta_validating_input').val(), '', 'The email  was cleared');
      assert.equal((0, _emberHook.$hook)('tta_personal_message_input').val(), '', 'The message input was cleared');

      // Check to see that mirage captured the message.

      var _server$db$ticketTran = _slicedToArray(server.db.ticketTransfers, 1),
          transfer = _server$db$ticketTran[0];

      assert.equal(transfer.message, 'Enjoy the show!', 'the message was included in the transfer');

      var _queryMetrics = queryMetrics('trackEvent'),
          first = _queryMetrics.first;

      assert.deepEqual(first, {
        event: 'created transfer',
        numberOfTickets: 2,
        transferId: transfer.id
      }, 'the transfer creation event was sent');
    });
  });

  (0, _qunit.test)('error shows on unsuccessful transfer', function (assert) {
    var orderId = '1';

    var _createOrder3 = (0, _createOrder8.default)(server, {
      ticketsPerEvent: 4,
      ticketTraits: ['errorsOnTransfer'],
      ticketConfig: {
        orderId: '1',
        userId: this.user.id
      }
    }),
        tickets = _createOrder3.tickets,
        _createOrder3$events = _slicedToArray(_createOrder3.events, 1),
        eventId = _createOrder3$events[0].id;

    visit('/transfers/new/' + orderId + '/' + eventId);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, tickets.length, 'and all have checkboxes');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox', { checked: true }).length, 0, 'but none are checked');
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: false }).length, 'the transfer button is disabled');
    });

    andThen(function () {
      click((0, _emberHook.$hook)('tta_ticket_row').eq(0));
      click((0, _emberHook.$hook)('tta_ticket_row').eq(1));
    });

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox', { checked: true }).length, 2, 'two are checked');
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: false }).length, 'the transfer button is still disabled');
    });

    andThen(function () {
      fillIn((0, _emberHook.$hook)('tta_validating_input'), 'spencer.price@ticketfly.com');
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_transfer_button', { enabled: true }).length, 'the transfer button is enabled');
      click((0, _emberHook.$hook)('tta_transfer_button'));
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_confirmation_modal').length, 'the confirmation modal is visible');
      assert.equal((0, _emberHook.$hook)('tta_grouped_tickets_ticket').length, 2, '2 tickets are being confirmed');
      assert.equal((0, _emberHook.$hook)('tta_confirmation_modal_email').text().trim(), 'spencer.price@ticketfly.com', 'confirm email is visible');
      click((0, _emberHook.$hook)('tta_confirmation_modal_transfer_button'));
    });

    andThen(function () {
      assert.ok((0, _emberHook.$hook)('tta_confirmation_modal').length, 'the confirmation modal is visible again');
      assert.equal((0, _emberHook.$hook)('tta_toast').text().trim(), 'Your transfer request encountered an error. Please try again later.', 'there is an error toast');

      var _queryMetrics2 = queryMetrics('trackEvent'),
          first = _queryMetrics2.first;

      assert.equal(first.event, 'error on create transfer', 'an error event was sent');
      assert.ok('error' in first, 'there is also an error message');
    });
  });

  (0, _qunit.test)('error shows when no tickets in an order', function (assert) {
    var orderId = '1';

    var _createOrder4 = (0, _createOrder8.default)(server, { ticketsPerEvent: 0 }),
        _createOrder4$events = _slicedToArray(_createOrder4.events, 1),
        eventId = _createOrder4$events[0].id;

    visit('/transfers/new/' + orderId + '/' + eventId);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_transfer_error_text').text().trim(), 'No transferable tickets found.', 'the error is displayed');
      assert.equal((0, _emberHook.$hook)('tta_toast').text().trim(), 'Error: No transferable tickets.', 'there is an error toast');
    });
  });

  (0, _qunit.test)('routes under `new` redirect if a selection has not been made', function (assert) {
    var orderId = '1';

    var _createOrder5 = (0, _createOrder8.default)(server, {
      ticketConfig: {
        orderId: orderId,
        userId: this.user.id
      }
    }),
        _createOrder5$events = _slicedToArray(_createOrder5.events, 1),
        eventId = _createOrder5$events[0].id;

    visit('/transfers/new/' + orderId + '/' + eventId + '/m/confirm');

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'routes back to `new`');
      visit('/transfers/new/' + orderId + '/' + eventId + '/m/terms');
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'routes back to `new`');
      visit('/transfers/new/' + orderId + '/' + eventId + '/m/success');
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'routes back to `new`');
    });
  });

  (0, _qunit.test)('can cancel a transfer', function (assert) {
    setBreakpoint('greaterThanMobile');

    var _createOrder6 = (0, _createOrder8.default)(server, {
      ticketTraits: ['hasTransfer'],
      ticketConfig: { userId: this.user.id }
    }),
        tickets = _createOrder6.tickets,
        _createOrder6$tickets = _slicedToArray(_createOrder6.tickets, 1),
        orderId = _createOrder6$tickets[0].orderId,
        _createOrder6$events = _slicedToArray(_createOrder6.events, 1),
        eventId = _createOrder6$events[0].id;

    var transfer = server.schema.ticketTransfers.find(1);

    visit('/transfers/new/' + orderId + '/' + eventId);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_transfer_status').length, tickets.length, 'and they show a status');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, 0, 'but none have checkboxes');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_cancel').length, tickets.length, 'all have a cancel button');

      click((0, _emberHook.$hook)('tta_ticket_row_cancel').eq(0));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId + '/m/cancel/' + transfer.id, 'the cancel transfer screen is visible');

      // Go back first.
      click((0, _emberHook.$hook)('tta_cancel_confirmation_back_button'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'the transfer screen is visible again');
      click((0, _emberHook.$hook)('tta_ticket_row_cancel').eq(0));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId + '/m/cancel/' + transfer.id, 'the cancel transfer screen is visible');

      click((0, _emberHook.$hook)('tta_cancel_confirmation_confirm_button'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'the transfer screen is visible again');
      assert.equal((0, _emberHook.$hook)('tta_toast').text().trim(), 'Transfer cancelled.', 'there is a success toast');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, 1, 'the ticket is able to be transferred again');

      var _queryMetrics3 = queryMetrics('trackEvent'),
          first = _queryMetrics3.first;

      assert.deepEqual(first, {
        event: 'cancelled transfer',
        numberOfTickets: tickets.length,
        transferId: transfer.id
      }, 'a cancellation event was tracked');
    });
  });

  (0, _qunit.test)('canceling a transfer with an error shows a toast', function (assert) {
    setBreakpoint('greaterThanMobile');

    var _createOrder7 = (0, _createOrder8.default)(server, {
      ticketTraits: ['hasTransfer', 'errorsOnCancelTransfer'],
      ticketConfig: { userId: this.user.id }
    }),
        tickets = _createOrder7.tickets,
        _createOrder7$tickets = _slicedToArray(_createOrder7.tickets, 1),
        orderId = _createOrder7$tickets[0].orderId,
        _createOrder7$events = _slicedToArray(_createOrder7.events, 1),
        eventId = _createOrder7$events[0].id;

    var transfer = server.schema.ticketTransfers.find(1);

    visit('/transfers/new/' + orderId + '/' + eventId);

    andThen(function () {
      assert.equal((0, _emberHook.$hook)('tta_ticket_row').length, tickets.length, 'all tickets are rendered');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_transfer_status').length, tickets.length, 'and they show a status');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, 0, 'but none have checkboxes');
      assert.equal((0, _emberHook.$hook)('tta_ticket_row_cancel').length, tickets.length, 'all have a cancel button');

      click((0, _emberHook.$hook)('tta_ticket_row_cancel').eq(0));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId + '/m/cancel/' + transfer.id, 'the cancel transfer screen is visible');
      click((0, _emberHook.$hook)('tta_cancel_confirmation_confirm_button'));
    });

    andThen(function () {
      assert.equal(currentURL(), '/transfers/new/' + orderId + '/' + eventId, 'the transfer screen is visible again');
      assert.equal((0, _emberHook.$hook)('tta_toast').text().trim(), 'We are unable to complete your request. Please try again later.', 'there is a success toast');

      var _queryMetrics4 = queryMetrics('trackEvent'),
          first = _queryMetrics4.first;

      assert.equal(first.event, 'error on cancel transfer', 'an error event was sent');
      assert.ok('error' in first, 'there is also an error message');
    });
  });
});
define('dummy/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('authenticators/oauth2.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'authenticators/oauth2.js should pass ESLint\n\n');
  });

  QUnit.test('breakpoints.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'breakpoints.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/dummy-login.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/dummy-login.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/animation-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/animation-test.js should pass ESLint\n\n');
  });

  QUnit.test('routes/animation-test/step-1.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/animation-test/step-1.js should pass ESLint\n\n');
  });

  QUnit.test('routes/animation-test/step-2.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/animation-test/step-2.js should pass ESLint\n\n');
  });

  QUnit.test('routes/animation-test/step-3.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/animation-test/step-3.js should pass ESLint\n\n');
  });

  QUnit.test('routes/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/index.js should pass ESLint\n\n');
  });

  QUnit.test('routes/orders/order.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/orders/order.js should pass ESLint\n\n');
  });

  QUnit.test('transitions.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'transitions.js should pass ESLint\n\n');
  });
});
define('dummy/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = destroyApp;
  function destroyApp(application) {
    _ember.default.run(application, 'destroy');
    _ember.default.$('.liquid-target-container').remove();
    server.shutdown();
  }
});
define('dummy/tests/helpers/ember-i18n/test-helpers', ['ember'], function (_ember) {
  'use strict';

  // example usage: find(`.header:contains(${t('welcome_message')})`)
  _ember.default.Test.registerHelper('t', function (app, key, interpolations) {
    var i18n = app.__container__.lookup('service:i18n');
    return i18n.t(key, interpolations);
  });

  // example usage: expectTranslation('.header', 'welcome_message');
  _ember.default.Test.registerHelper('expectTranslation', function (app, element, key, interpolations) {
    var text = app.testHelpers.t(key, interpolations);

    assertTranslation(element, key, text);
  });

  var assertTranslation = function () {
    if (typeof QUnit !== 'undefined' && typeof QUnit.assert.ok === 'function') {
      return function (element, key, text) {
        QUnit.assert.ok(find(element + ':contains(' + text + ')').length, 'Found translation key ' + key + ' in ' + element);
      };
    } else if (typeof expect === 'function') {
      return function (element, key, text) {
        var found = !!find(element + ':contains(' + text + ')').length;
        expect(found).to.equal(true);
      };
    } else {
      return function () {
        throw new Error("ember-i18n could not find a compatible test framework");
      };
    }
  }();
});
define('dummy/tests/helpers/ember-keyboard/register-test-helpers', ['exports', 'ember', 'ember-keyboard', 'ember-keyboard/fixtures/modifiers-array', 'ember-keyboard/utils/get-cmd-key'], function (exports, _ember, _emberKeyboard, _modifiersArray, _getCmdKey) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    _ember.default.Test.registerAsyncHelper('keyDown', function (app, attributes, element) {
      return keyEvent(app, attributes, 'keydown', element);
    });

    _ember.default.Test.registerAsyncHelper('keyUp', function (app, attributes, element) {
      return keyEvent(app, attributes, 'keyup', element);
    });

    _ember.default.Test.registerAsyncHelper('keyPress', function (app, attributes, element) {
      return keyEvent(app, attributes, 'keypress', element);
    });
  };

  var keyEvent = function keyEvent(app, attributes, type, element) {
    var event = attributes.split('+').reduce(function (event, attribute) {
      if (_modifiersArray.default.indexOf(attribute) > -1) {
        attribute = attribute === 'cmd' ? (0, _getCmdKey.default)() : attribute;
        event[attribute + 'Key'] = true;
      } else {
        event.keyCode = (0, _emberKeyboard.getKeyCode)(attribute);
      }

      return event;
    }, {});

    return app.testHelpers.triggerEvent(element || document, type, event);
  };
});
define('dummy/tests/helpers/ember-simple-auth', ['exports', 'ember-simple-auth/authenticators/test'], function (exports, _test) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.authenticateSession = authenticateSession;
  exports.currentSession = currentSession;
  exports.invalidateSession = invalidateSession;


  var TEST_CONTAINER_KEY = 'authenticator:test';

  function ensureAuthenticator(app, container) {
    var authenticator = container.lookup(TEST_CONTAINER_KEY);
    if (!authenticator) {
      app.register(TEST_CONTAINER_KEY, _test.default);
    }
  }

  function authenticateSession(app, sessionData) {
    var container = app.__container__;

    var session = container.lookup('service:session');
    ensureAuthenticator(app, container);
    session.authenticate(TEST_CONTAINER_KEY, sessionData);
    return wait();
  };

  function currentSession(app) {
    return app.__container__.lookup('service:session');
  };

  function invalidateSession(app) {
    var session = app.__container__.lookup('service:session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    return wait();
  };
});
define('dummy/tests/helpers/flash-message', ['ember', 'ember-cli-flash/flash/object'], function (_ember, _object) {
  'use strict';

  var K = _ember.default.K;


  _object.default.reopen({ init: K });
});
define('dummy/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'dummy/tests/helpers/start-app', 'dummy/tests/helpers/destroy-app'], function (exports, _qunit, _startApp, _destroyApp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _startApp.default)();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _destroyApp.default)(_this.application);
        });
      }
    });
  };

  var RSVP = Ember.RSVP;
  var Promise = RSVP.Promise;
});
define('dummy/tests/helpers/module-for-integration', ['exports', 'ember-runloop', 'qunit', 'ember-test-helpers', 'ember-qunit'], function (exports, _emberRunloop, _qunit, _emberTestHelpers, _emberQunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.moduleForIntegration = moduleForIntegration;
  exports.test = test;
  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve;
  function moduleForIntegration(name) {
    var callbacks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var _beforeEach = callbacks.beforeEach,
        _afterEach = callbacks.afterEach;

    delete callbacks.beforeEach;
    delete callbacks.afterEach;

    var module = new _emberTestHelpers.TestModuleForIntegration(name, name, callbacks);

    (0, _qunit.module)(module.name, {
      beforeEach: function beforeEach() {
        var _this = this,
            _arguments = arguments;

        module.setContext(this);

        return module.setup.apply(module, arguments).then(function () {
          if (_beforeEach) {
            return _beforeEach.apply(_this, _arguments);
          }
        });
      },
      afterEach: function afterEach() {
        var _arguments2 = arguments;

        var result = void 0;

        if (_afterEach) {
          result = _afterEach.apply(this, arguments);
        }

        return resolve(result).then(function () {
          return module.teardown.apply(module, _arguments2);
        });
      }
    });
  }

  function test(name, callback) {
    return (0, _emberQunit.test)(name, function () {
      return (0, _emberRunloop.bind)(this, callback).apply(undefined, arguments);
    });
  }
});
define('dummy/tests/helpers/resolver', ['exports', 'dummy/resolver', 'dummy/config/environment'], function (exports, _resolver, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };

  exports.default = resolver;
});
define('dummy/tests/helpers/responsive', ['exports', 'ember', 'ember-responsive/media'], function (exports, _ember, _media) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setBreakpointForIntegrationTest = setBreakpointForIntegrationTest;
  var getOwner = _ember.default.getOwner;
  var classify = _ember.default.String.classify;


  _media.default.reopen({
    // Change this if you want a different default breakpoint in tests.
    _defaultBreakpoint: 'desktop',

    _breakpointArr: _ember.default.computed('breakpoints', function () {
      return Object.keys(this.get('breakpoints')) || _ember.default.A([]);
    }),

    _forceSetBreakpoint: function _forceSetBreakpoint(breakpoint) {
      var found = false;

      var props = {};
      this.get('_breakpointArr').forEach(function (bp) {
        var val = bp === breakpoint;
        if (val) {
          found = true;
        }

        props['is' + classify(bp)] = val;
      });

      if (found) {
        this.setProperties(props);
      } else {
        throw new Error('You tried to set the breakpoint to ' + breakpoint + ', which is not in your app/breakpoint.js file.');
      }
    },
    match: function match() {},
    init: function init() {
      this._super.apply(this, arguments);

      this._forceSetBreakpoint(this.get('_defaultBreakpoint'));
    }
  });

  exports.default = _ember.default.Test.registerAsyncHelper('setBreakpoint', function (app, breakpoint) {
    // this should use getOwner once that's supported
    var mediaService = app.__deprecatedInstance__.lookup('service:media');
    mediaService._forceSetBreakpoint(breakpoint);
  });
  function setBreakpointForIntegrationTest(container, breakpoint) {
    var mediaService = getOwner(container).lookup('service:media');
    mediaService._forceSetBreakpoint(breakpoint);
    container.set('media', mediaService);

    return mediaService;
  }
});
define('dummy/tests/helpers/setup-mirage-for-integration', ['exports', 'dummy/initializers/ember-cli-mirage'], function (exports, _emberCliMirage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startMirage;
  function startMirage(container) {
    _emberCliMirage.default.initialize(container);
  }
});
define('dummy/tests/helpers/start-app', ['exports', 'ember-platform', 'ember-runloop', 'dummy/app', 'dummy/config/environment', 'dummy/tests/helpers/ember-keyboard/register-test-helpers', 'dummy/tests/helpers/ticketfly-metrics-test-helper'], function (exports, _emberPlatform, _emberRunloop, _app, _environment, _registerTestHelpers) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startApp;
  function startApp(attrs) {
    var application = void 0;
    var attributes = (0, _emberPlatform.assign)({}, _environment.default.APP, attrs);

    (0, _emberRunloop.default)(function () {
      application = _app.default.create(attributes);
      application.setupForTesting();
      (0, _registerTestHelpers.default)();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('dummy/tests/helpers/test-module-for-engine', ['exports', 'ember-engines/test-support/engine-resolver-for', 'ember-qunit'], function (exports, _engineResolverFor, _emberQunit) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.moduleFor = exports.moduleForComponent = undefined;


  function moduleForComponent(componentName, testName) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    options.resolver = (0, _engineResolverFor.default)('ticket-transfer-addon');
    (0, _emberQunit.moduleForComponent)(componentName, testName, options);
  }

  function moduleFor(registryItem, testName) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    options.resolver = (0, _engineResolverFor.default)('ticket-transfer-addon');
    (0, _emberQunit.moduleFor)(registryItem, testName, options);
  }

  exports.moduleForComponent = moduleForComponent;
  exports.moduleFor = moduleFor;
});
define('dummy/tests/helpers/ticketfly-metrics-test-helper', ['exports', 'ember-test', 'ember-metal/get'], function (exports, _emberTest, _get) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var keys = Object.keys;
  exports.default = _emberTest.default.registerHelper('queryMetrics', function (app, type) {
    var segmentStub = getSegmentStub(app);
    var args = (0, _get.default)(segmentStub, type + '.args') || [];

    // Flatten the args. 
    var flatArgs = args.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          record = _ref2[0];

      return record;
    });

    return new MetricsQueryResult(flatArgs);
  });


  function getSegmentStub(app) {
    var metrics = app.__container__.lookup('service:metrics');
    return (0, _get.default)(metrics, '_adapters.SegmentStub');
  }

  var MetricsQueryResult = function () {
    function MetricsQueryResult(results) {
      _classCallCheck(this, MetricsQueryResult);

      this._results = results || [];
    }

    _createClass(MetricsQueryResult, [{
      key: 'where',
      value: function where(query) {
        var filtered = this._results.filter(function (record) {
          return keys(query).every(function (key) {
            return query[key] === record[key];
          });
        });

        return new MetricsQueryResult(filtered);
      }
    }, {
      key: 'length',
      get: function get() {
        return this._results.length;
      }
    }, {
      key: 'first',
      get: function get() {
        return this._results[0];
      }
    }, {
      key: 'last',
      get: function get() {
        return this._results[this._results.length - 1];
      }
    }]);

    return MetricsQueryResult;
  }();
});
define('dummy/tests/integration/components/tta-accept-completed-tickets-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-accept-completed-tickets', 'Integration | Component | tta accept completed tickets', {
    integration: true,
    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it handles the CANCELLED state', function (assert) {
    this.set('tickets', [{ variantName: 'GA1' }, { variantName: 'GA1' }, { variantName: 'GA2' }]);

    this.set('transfer', {
      sender: {
        firstName: 'Spencer'
      },
      status: 'CANCELLED'
    });

    this.render(Ember.HTMLBars.template({
      "id": "IRBw2xmf",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-completed-tickets\"],null,[[\"tickets\",\"transfer\"],[[28,[\"tickets\"]],[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_variant_name')).eq(0).text().trim(), '2 x GA1');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_variant_name')).eq(1).text().trim(), '1 x GA2');

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by Spencer');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Cancelled');

    this.set('transfer.sender', {
      email: 'spencer.price@ticketfly.com'
    });

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by spencer.price@ticketfly.com');

    this.set('transfer.status', 'DENIED');

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Declined');

    this.set('transfer.status', 'COMPLETED');

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), 'Accepted');
  });

  (0, _emberQunit.test)('it does not render a status with the PENDING state', function (assert) {
    this.set('tickets', [{ variantName: 'GA1' }, { variantName: 'GA1' }, { variantName: 'GA2' }]);

    this.set('transfer', {
      sender: {
        firstName: 'Spencer'
      },
      status: 'PENDING',
      isPending: true
    });

    this.render(Ember.HTMLBars.template({
      "id": "IRBw2xmf",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-completed-tickets\"],null,[[\"tickets\",\"transfer\"],[[28,[\"tickets\"]],[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_variant_name')).eq(0).text().trim(), '2 x GA1');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_variant_name')).eq(1).text().trim(), '1 x GA2');

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_sent_by')).eq(0).text().trim(), 'Sent by Spencer');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_complete_ticket_row_status')).eq(0).text().trim(), '');
  });
});
define('dummy/tests/integration/components/tta-accept-header-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-accept-header', 'Integration | Component | tta accept header', {
    integration: true
  });

  (0, _emberQunit.test)('it uses the correct attributes for acceptable transfer based on what is available', function (assert) {
    this.set('transfer', {
      isAcceptable: true,
      sender: {
        firstName: 'Spencer',
        email: 'spencer.price@ticketfly.com'
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'Spencer sent you tickets. Would you like to accept?');

    this.set('transfer', {
      isAcceptable: true,
      sender: {
        firstName: undefined,
        email: 'spencer.price@ticketfly.com'
      }
    });

    assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'spencer.price@ticketfly.com sent you tickets. Would you like to accept?');
  });

  (0, _emberQunit.test)('it shows the correct header message if transfer was already accepted', function (assert) {
    this.set('transfer', {
      isAcceptable: false,
      isPending: false,
      status: 'COMPLETED'
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('h2').text().trim(), 'You can no longer accept this transfer because it has already been accepted.');
  });

  (0, _emberQunit.test)('it shows the correct header message if transfer was not previously accepted', function (assert) {
    this.set('transfer', {
      isAcceptable: true,
      isPending: true,
      status: 'PENDING',
      sender: {
        firstName: undefined,
        email: 'spencer.price@ticketfly.com'
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));
    this.set('transfer.status', 'COMPLETED');
    this.set('transfer.isAcceptable', false);
    this.set('transfer.isPending', false);

    assert.equal(this.$('h2').text().trim().replace(/\n+/g, ' ').replace(/\s+/g, ' '), 'spencer.price@ticketfly.com sent you tickets.');
  });

  (0, _emberQunit.test)('it shows the cancelled message if transfer was cancelled', function (assert) {
    this.set('transfer', {
      isAcceptable: false,
      isPending: false,
      status: 'CANCELLED'
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('h2').text().trim(), 'Ticket transfer cancelled.');
  });

  (0, _emberQunit.test)('it shows the declined message if transfer was denied', function (assert) {
    this.set('transfer', {
      isAcceptable: false,
      isPending: false,
      status: 'DENIED'
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('h2').text().trim(), 'Ticket transfer declined.');
  });

  (0, _emberQunit.test)('it shows unacceptable message if transfer is not acceptable', function (assert) {
    this.set('transfer', {
      isAcceptable: false,
      isPending: true,
      acceptanceState: {
        acceptable: false,
        description: 'Not acceptable!'
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "2/xo7+b2",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-header\"],null,[[\"transfer\"],[[28,[\"transfer\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('h2').text().trim().replace(/[\s\n]+/g, ' '), 'You can no longer accept this transfer. Status: Not acceptable!');
  });
});
define('dummy/tests/integration/components/tta-accept-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-accept', 'Integration | Component | tta accept', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('the tickets are rendered with numbers according to the variantName', function (assert) {
    this.set('event', {});
    this.set('tickets', [{ variantName: 'a' }, { variantName: 'a' }, { variantName: 'b' }]);

    this.render(Ember.HTMLBars.template({
      "id": "GDagkzdt",
      "block": "{\"statements\":[[1,[33,[\"tta-accept\"],null,[[\"event\",\"tickets\"],[[28,[\"event\"]],[28,[\"tickets\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row')).length, 3, 'there are three accepted tickets');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_count_info')).eq(0).text().trim(), '1 of 2');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_count_info')).eq(1).text().trim(), '2 of 2');
    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_count_info')).eq(2).text().trim(), '1 of 1');
  });
});
define('dummy/tests/integration/components/tta-accept-ticket-row-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-accept-ticket-row', 'Integration | Component | tta accept ticket row', {
    integration: true
  });

  (0, _emberQunit.test)('it displays the variant description', function (assert) {
    assert.expect(1);

    this.set('ticket', { variantName: 'foo' });

    this.render(Ember.HTMLBars.template({
      "id": "ZpnLWf4E",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_variant_description')).text().trim(), 'foo');
  });

  (0, _emberQunit.test)('it displays the index and ticketsLength', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "Vk7HNAHP",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-ticket-row\"],null,[[\"index\",\"ticketsLength\"],[2,5]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_count_info')).text().trim(), '3 of 5');
  });

  (0, _emberQunit.test)('it seat info if present', function (assert) {
    assert.expect(1);

    this.set('ticket', { properties: { section: 'C', seat: '12' } });

    this.render(Ember.HTMLBars.template({
      "id": "JW6+L6Qo",
      "block": "{\"statements\":[[1,[33,[\"tta-accept-ticket-row\"],null,[[\"index\",\"ticketsLength\",\"ticket\"],[2,5,[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_accept_ticket_row_count_info')).text().trim(), 'Section C · Seat 12');
  });
});
define('dummy/tests/integration/components/tta-block-body-scroll-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember'], function (_emberQunit, _testModuleForEngine, _ember) {
  'use strict';

  var $ = _ember.default.$;


  (0, _testModuleForEngine.moduleForComponent)('tta-block-body-scroll', 'Integration | Component | tta block body scroll', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    this.set('isVisible', true);
    this.render(_ember.default.HTMLBars.template({
      "id": "3SVY6CNh",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"if\"],[[28,[\"isVisible\"]]],null,{\"statements\":[[0,\"      \"],[1,[26,[\"tta-block-body-scroll\"]],false],[0,\"\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal($('body').css('overflow'), 'hidden');

    this.set('isVisible', false);

    assert.equal($('body').css('overflow'), 'visible');
  });
});
define('dummy/tests/integration/components/tta-confirmation-modal-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-confirmation-modal', 'Integration | Component | tta confirmation modal', {
    integration: true,
    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('yields content', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "QcBUnshR",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-confirmation-modal\"],null,null,{\"statements\":[[0,\"      Stuff.\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_confirmation_modal')).text().trim(), 'Stuff.', 'text is rendered');
  });
});
define('dummy/tests/integration/components/tta-event-info-test', ['ember', 'moment', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'dummy/tests/helpers/responsive'], function (_ember, _moment, _emberQunit, _testModuleForEngine, _emberHook, _responsive) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-event-info', 'Integration | Component | tta event info', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('`tta-event-info` renders the event img in order of priority', function (assert) {
    (0, _responsive.setBreakpointForIntegrationTest)(this, 'greaterThanMobile');
    assert.expect(4);

    this.set('event', {
      imageUrls: {
        poster: '/foo/poster.png',
        card: '/foo/card.png',
        banner: '/foo/banner.png'
      }
    });

    this.render(_ember.default.HTMLBars.template({
      "id": "ugQH59ma",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\",\"media\"],[[28,[\"event\"]],[28,[\"media\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_img')).length, 1, 'there is an image rendered');
    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_img')).attr('src'), '/foo/poster.png', 'correct src');

    this.set('event.imageUrls.poster', '');

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_img')).attr('src'), '/foo/card.png', 'correct src');

    this.set('event.imageUrls.card', '');

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_img')).attr('src'), '/foo/banner.png', 'correct src');
  });

  (0, _emberQunit.test)('`tta-event-info` does not render the image if on mobile', function (assert) {
    (0, _responsive.setBreakpointForIntegrationTest)(this, 'mobile');
    assert.expect(1);

    this.set('event', {
      imageUrls: {
        poster: '/foo/poster.png',
        card: '/foo/card.png',
        banner: '/foo/banner.png'
      }
    });

    this.render(_ember.default.HTMLBars.template({
      "id": "ugQH59ma",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\",\"media\"],[[28,[\"event\"]],[28,[\"media\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_img')).length, 0, 'there is no image rendered');
  });

  (0, _emberQunit.test)('`tta-event-info` renders the event name', function (assert) {
    assert.expect(2);

    this.set('event', _ember.default.Object.create({
      name: 'Beruit'
    }));

    this.render(_ember.default.HTMLBars.template({
      "id": "8XAT5rnF",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\"],[[28,[\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var tableName = this.$((0, _emberHook.hook)('tta_event_table_name'));
    assert.equal(tableName.text().trim(), 'Beruit', 'correct text');
    assert.ok(tableName.hasClass('text-large-6-1'), 'larger text if no `topLineInfo`');
  });

  (0, _emberQunit.test)('`tta-event-info` renders the top line info', function (assert) {
    assert.expect(2);

    this.set('event', _ember.default.Object.create({
      name: 'Beruit',
      topLineInfo: 'Hamilton presents'
    }));

    this.render(_ember.default.HTMLBars.template({
      "id": "8XAT5rnF",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\"],[[28,[\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var topLine = this.$((0, _emberHook.hook)('tta_event_table_top_line'));
    var tableName = this.$((0, _emberHook.hook)('tta_event_table_name'));
    assert.equal(topLine.text().trim(), 'Hamilton presents', 'correct text');
    assert.ok(tableName.hasClass('text-large-2'), 'smaller text if `topLineInfo`');
  });

  (0, _emberQunit.test)('`tta-event-info` renders the event date', function (assert) {
    assert.expect(1);

    this.set('event', _ember.default.Object.create({
      startTime: (0, _moment.default)('2000-01-05 21:50:00')
    }));

    this.render(_ember.default.HTMLBars.template({
      "id": "8XAT5rnF",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\"],[[28,[\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_date')).text().trim(), 'Wednesday, January 5, 2000', 'correct text');
  });

  (0, _emberQunit.test)('`tta-event-info` renders the event door and start times', function (assert) {
    assert.expect(3);

    this.set('event', _ember.default.Object.create({
      doorTime: (0, _moment.default)('2000-01-05 21:50:00'),
      startTime: (0, _moment.default)('2000-01-05 22:50:00')
    }));

    this.render(_ember.default.HTMLBars.template({
      "id": "8XAT5rnF",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\"],[[28,[\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Doors 9:50 PM | Show 10:50 PM', 'correct text');

    this.set('event', _ember.default.Object.create({
      doorTime: null,
      startTime: (0, _moment.default)('2000-01-05 22:50:00')
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Show 10:50 PM', 'correct text');

    this.set('event', _ember.default.Object.create({
      doorTime: (0, _moment.default)('2000-01-05 22:50:00'),
      startTime: null
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_times')).text().replace(/[\n\s]+/g, ' ').trim(), 'Doors 10:50 PM', 'correct text');
  });

  (0, _emberQunit.test)('`tta-event-info` renders the event location', function (assert) {
    assert.expect(1);

    this.set('event', _ember.default.Object.create({
      venue: {
        name: 'Bar',
        address: {
          city: 'Foo',
          stateCode: 'BZ'
        }
      }
    }));

    this.render(_ember.default.HTMLBars.template({
      "id": "8XAT5rnF",
      "block": "{\"statements\":[[1,[33,[\"tta-event-info\"],null,[[\"event\"],[[28,[\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_event_table_location')).text().trim(), 'Bar, Foo, BZ', 'correct text');
  });
});
define('dummy/tests/integration/components/tta-grouped-tickets-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  (0, _testModuleForEngine.moduleForComponent)('tta-grouped-tickets', 'Integration | Component | tta grouped tickets', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it groups tickets', function (assert) {
    var _this = this;

    this.set('tickets', [{ variantName: 'Test A', code: '12345' }, { variantName: 'Test B', code: '23456' }, { variantName: 'Test C', code: '34567' }, { variantName: 'Test A', code: '45678' }, { variantName: 'Test B', code: '56789' }]);

    this.render(Ember.HTMLBars.template({
      "id": "UfKLFBRm",
      "block": "{\"statements\":[[1,[33,[\"tta-grouped-tickets\"],null,[[\"tickets\"],[[28,[\"tickets\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var groups = this.$((0, _emberHook.hook)('tta_grouped_tickets_grouping'));

    assert.equal(groups.length, 3, 'there are three groups');
    assert.equal(groups.eq(0).text().trim(), '2 x Test A');
    assert.equal(groups.eq(1).text().trim(), '2 x Test B');
    assert.equal(groups.eq(2).text().trim(), '1 x Test C');

    [['Test A', 0, '*2345'], ['Test A', 1, '*5678'], ['Test B', 0, '*3456'], ['Test B', 1, '*6789'], ['Test C', 0, '*4567']].forEach(function (_ref2, eachIndex) {
      var _ref3 = _slicedToArray(_ref2, 3),
          variantName = _ref3[0],
          index = _ref3[1],
          code = _ref3[2];

      var element = _this.$((0, _emberHook.hook)('tta_grouped_tickets_ticket', { variantName: variantName, index: index }));
      assert.equal(element.text().trim(), 'Barcode: ' + code, 'Ticket #' + eachIndex + ' displays correct code');
    });
  });
});
define('dummy/tests/integration/components/tta-if-resolved-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-runloop'], function (_emberQunit, _testModuleForEngine, _emberRunloop) {
  'use strict';

  var RSVP = Ember.RSVP;
  var Promise = RSVP.Promise;


  (0, _testModuleForEngine.moduleForComponent)('tta-if-resolved', 'Integration | Component | tta if resolved', {
    integration: true
  });

  (0, _emberQunit.test)('it yields inverse until promises resolve', function (assert) {
    var _this = this;

    var done = assert.async();

    var resolvePromise = void 0;
    this.set('promise', new Promise(function (resolve) {
      resolvePromise = resolve;
    }));

    this.render(Ember.HTMLBars.template({
      "id": "RsSbBejd",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-if-resolved\"],[[28,[\"promise\"]]],null,{\"statements\":[[0,\"      \"],[11,\"div\",[]],[15,\"class\",\"loaded\"],[13],[1,[28,[\"val\",\"name\"]],false],[14],[0,\"\\n\"]],\"locals\":[\"val\"]},{\"statements\":[[0,\"      \"],[11,\"div\",[]],[15,\"class\",\"loading\"],[13],[0,\"Loading\"],[14],[0,\"\\n\"]],\"locals\":[]}],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.loading').text().trim(), 'Loading');

    resolvePromise({ name: 'Loaded' });

    dblNext(function () {
      assert.equal(_this.$('.loaded').eq(0).text().trim(), 'Loaded');
      done();
    });
  });

  // This allows concurrency & animations to complete.
  function dblNext(cb) {
    return (0, _emberRunloop.next)(function () {
      (0, _emberRunloop.next)(cb);
    });
  }
});
define('dummy/tests/integration/components/tta-modal-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-keyboard', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberKeyboard, _sinon) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _testModuleForEngine.moduleForComponent)('tta-modal', 'Integration | Component | tta modal', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberKeyboard.initialize)();
    }
  });

  (0, _emberQunit.test)('it triggers action on escape key', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var callback;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              callback = _sinon.default.stub();


              this.on('action', callback);

              this.render(Ember.HTMLBars.template({
                "id": "CylcT8eZ",
                "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-modal\"],null,[[\"on-close\"],[[33,[\"action\"],[[28,[null]],\"action\"],null]]],{\"statements\":[[0,\"      template block text\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
                "meta": {}
              }));

              _context.next = 5;
              return (0, _emberKeyboard.triggerKeyPress)('Escape');

            case 5:

              assert.equal(callback.callCount, 1, 'the `on-close` action was called');

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define('dummy/tests/integration/components/tta-personal-message-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberHook, _sinon) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  (0, _testModuleForEngine.moduleForComponent)('tta-personal-message', 'Integration | Component | tta personal message', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it can add a personal message', function (assert) {
    var _this = this;

    this.set('message', '');

    this.on('updateMessage', function (message) {
      _this.set('message', message);
    });

    this.render(Ember.HTMLBars.template({
      "id": "ENd6NHiX",
      "block": "{\"statements\":[[1,[33,[\"tta-personal-message\"],null,[[\"action\"],[[33,[\"action\"],[[28,[null]],\"updateMessage\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$((0, _emberHook.hook)('tta_personal_message_add')).click();

    this.$((0, _emberHook.hook)('tta_personal_message_input')).val('Test 1234').trigger('keyup');

    assert.equal(this.get('message'), 'Test 1234', 'the message was updated');

    this.$((0, _emberHook.hook)('tta_personal_message_clear')).click();

    assert.equal(this.get('message'), '', 'the message was cleared');
  });

  (0, _emberQunit.test)('the personal message can be edited', function (assert) {
    var _this2 = this;

    this.set('message', '');

    this.on('updateMessage', function (message) {
      _this2.set('message', message);
    });

    this.render(Ember.HTMLBars.template({
      "id": "ENd6NHiX",
      "block": "{\"statements\":[[1,[33,[\"tta-personal-message\"],null,[[\"action\"],[[33,[\"action\"],[[28,[null]],\"updateMessage\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$((0, _emberHook.hook)('tta_personal_message_add')).click();

    this.$((0, _emberHook.hook)('tta_personal_message_input')).val('Hello????').trigger('keyup');

    assert.equal(this.get('message'), 'Hello????', 'the message was updated');

    this.$((0, _emberHook.hook)('tta_personal_message_input')).val('Howdy!').trigger('keyup');

    assert.equal(this.get('message'), 'Howdy!', 'the message was updated');
  });

  (0, _emberQunit.test)('the personal message is constrained to 1,000 characters', function (assert) {
    var str = makeStringOfLength(2000);
    var stub = _sinon.default.stub();

    this.on('updateMessage', stub);

    this.render(Ember.HTMLBars.template({
      "id": "ENd6NHiX",
      "block": "{\"statements\":[[1,[33,[\"tta-personal-message\"],null,[[\"action\"],[[33,[\"action\"],[[28,[null]],\"updateMessage\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$((0, _emberHook.hook)('tta_personal_message_add')).click();

    assert.equal(this.$('textarea').attr('maxlength'), '1000', 'the textarea has a max length attribute');

    this.$((0, _emberHook.hook)('tta_personal_message_input')).val(str).trigger('keyup');

    var _stub$getCall = stub.getCall(1),
        _stub$getCall$args = _slicedToArray(_stub$getCall.args, 1),
        calledString = _stub$getCall$args[0];

    assert.equal(calledString.length, 1000, 'string was capped at 1000 characters');
  });

  function makeStringOfLength(length) {
    return Array(length).join('a');
  }
});
define('dummy/tests/integration/components/tta-same-user-modal-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberHook, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-modal', 'Integration | Component | tta same user modal', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('the email address is rendered', function (assert) {
    this.register('service:session', {}, { instantiate: false });
    this.render(Ember.HTMLBars.template({
      "id": "eZGbcpRX",
      "block": "{\"statements\":[[1,[33,[\"tta-same-user-modal\"],null,[[\"email\"],[\"spencer.price@ticketfly.com\"]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('same_user_modal_email')).text().trim(), 'spencer.price@ticketfly.com');
  });

  (0, _emberQunit.test)('the switch accounts button calls the invalidate session method', function (assert) {
    var invalidate = _sinon.default.stub();

    this.register('service:session', { invalidate: invalidate }, { instantiate: false });

    this.render(Ember.HTMLBars.template({
      "id": "OqYXb+Ac",
      "block": "{\"statements\":[[1,[26,[\"tta-same-user-modal\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var button = this.$((0, _emberHook.hook)('same_user_modal_switch_accounts'));

    button.click();

    assert.ok(button.attr('disabled'), 'the button is disabled');
    assert.equal(invalidate.callCount, 1);
  });
});
define('dummy/tests/integration/components/tta-selected-list-test', ['sinon', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_sinon, _emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-selected-list', 'Integration | Component | tta selected list', {
    integration: true
  });

  (0, _emberQunit.test)('`tta-selected-list` yields a list of selected and not selected items', function (assert) {
    var stub = _sinon.default.stub();
    this.on('selectionChanged', stub);

    this.set('list', [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);

    this.render(Ember.HTMLBars.template({
      "id": "fz/CqkHH",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-selected-list\"],null,[[\"list\",\"selection-changed\"],[[28,[\"list\"]],[33,[\"action\"],[[28,[null]],\"selectionChanged\"],null]]],{\"statements\":[[6,[\"each\"],[[28,[\"ctx\",\"selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null],[6,[\"each\"],[[28,[\"ctx\",\"not-selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"not-selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.not-selected').text().trim(), '1234');
    assert.equal(this.$('.selected').text().trim(), '');

    this.$('.not-selected:eq(0)').click();

    assert.deepEqual(stub.getCall(0).args[0], [{ id: '1' }], 'the action was triggered correctly');

    this.$('.not-selected:eq(0)').click();

    assert.deepEqual(stub.getCall(1).args[0], [{ id: '1' }, { id: '2' }], 'the action was triggered correctly');

    assert.equal(this.$('.not-selected').text().trim(), '34');
    assert.equal(this.$('.selected').text().trim(), '12');

    this.$('.selected:eq(0)').click();

    assert.deepEqual(stub.getCall(2).args[0], [{ id: '2' }], 'the action was triggered correctly');

    assert.equal(this.$('.not-selected').text().trim(), '134');
    assert.equal(this.$('.selected').text().trim(), '2');
  });

  (0, _emberQunit.test)('`tta-selected-list` yields a list of all items, with a helper for determining toggle', function (assert) {
    var stub = _sinon.default.stub();
    var list = [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }];

    this.on('selectionChanged', stub);

    this.set('list', list);

    this.render(Ember.HTMLBars.template({
      "id": "vZFLwd/g",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-selected-list\"],null,[[\"list\",\"selection-changed\"],[[28,[\"list\"]],[33,[\"action\"],[[28,[null]],\"selectionChanged\"],null]]],{\"statements\":[[6,[\"each\"],[[28,[\"ctx\",\"all-items\"]]],null,{\"statements\":[[11,\"span\",[]],[16,\"class\",[33,[\"if\"],[[33,[\"contains\"],[[28,[\"sel\"]],[28,[\"ctx\",\"selected\"]]],null],\"selected\",\"not-selected\"],null],null],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.not-selected').text().trim(), '1234');
    assert.equal(this.$('.selected').text().trim(), '');

    this.$('.not-selected:eq(0)').click();

    assert.deepEqual(stub.getCall(0).args[0], [list[0]], 'the action was triggered correctly');
    assert.equal(this.$('.not-selected').text().trim(), '234');

    this.$('.not-selected:eq(0)').click();

    assert.deepEqual(stub.getCall(1).args[0], [list[0], list[1]], 'the action was triggered correctly');

    assert.equal(this.$('.not-selected').text().trim(), '34');
    assert.equal(this.$('.selected').text().trim(), '12');

    this.$('.selected:eq(0)').click();

    assert.deepEqual(stub.getCall(2).args[0], [list[1]], 'the action was triggered correctly');

    assert.equal(this.$('.not-selected').text().trim(), '134');
    assert.equal(this.$('.selected').text().trim(), '2');
  });

  (0, _emberQunit.test)('`tta-selected-list` resets when a new list is provided', function (assert) {
    this.set('list', [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);

    this.render(Ember.HTMLBars.template({
      "id": "oDa04f1C",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-selected-list\"],null,[[\"list\"],[[28,[\"list\"]]]],{\"statements\":[[6,[\"each\"],[[28,[\"ctx\",\"selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null],[6,[\"each\"],[[28,[\"ctx\",\"not-selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"not-selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.not-selected').text().trim(), '1234');

    this.$('.not-selected:eq(0)').click();

    assert.equal(this.$('.not-selected').text().trim(), '234');

    this.set('list', [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }]);

    assert.equal(this.$('.not-selected').text().trim(), '12345');
  });

  (0, _emberQunit.test)('`tta-selected-list` accepts a list of already-selected items', function (assert) {
    var item1 = { id: '1' };
    var item2 = { id: '2' };

    this.set('selected', [item1]);
    this.set('list', [item1, item2, { id: '3' }, { id: '4' }]);

    this.render(Ember.HTMLBars.template({
      "id": "a+va/au7",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-selected-list\"],null,[[\"selected\",\"list\"],[[28,[\"selected\"]],[28,[\"list\"]]]],{\"statements\":[[6,[\"each\"],[[28,[\"ctx\",\"selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null],[6,[\"each\"],[[28,[\"ctx\",\"not-selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"not-selected\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.not-selected').text().trim(), '234');
    assert.equal(this.$('.selected').text().trim(), '1');

    this.set('selected', [item2]);

    assert.equal(this.$('.not-selected').text().trim(), '134');
    assert.equal(this.$('.selected').text().trim(), '2');
  });

  (0, _emberQunit.test)('`tta-selected-list` does not render any elements', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "+ilyfhr0",
      "block": "{\"statements\":[[1,[26,[\"tta-selected-list\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));
    assert.equal(this.$('*').length, 0);
  });

  (0, _emberQunit.test)('`tta-selected-list` does not allow mutations on action result to affect component', function (assert) {
    this.set('list', [{ id: '1' }]);
    this.on('selectionChanged', function (list) {
      return list.clear();
    });

    this.render(Ember.HTMLBars.template({
      "id": "jYnKuD1h",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-selected-list\"],null,[[\"list\",\"selection-changed\"],[[28,[\"list\"]],[33,[\"action\"],[[28,[null]],\"selectionChanged\"],null]]],{\"statements\":[[6,[\"each\"],[[28,[\"ctx\",\"not-selected\"]]],null,{\"statements\":[[11,\"span\",[]],[15,\"class\",\"item\"],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]],[28,[\"sel\"]]]],[13],[1,[28,[\"sel\",\"id\"]],false],[14]],\"locals\":[\"sel\"]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.item').text().trim(), '1');

    this.$('.item').eq(0).click();

    assert.equal(this.$('.item').text().trim(), '');
  });
});
define('dummy/tests/integration/components/tta-show-hide-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-show-hide', 'Integration | Component | tta show hide', {
    integration: true
  });

  (0, _emberQunit.test)('it renders closed by default', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "vW+mf2zt",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide\"],null,null,{\"statements\":[[0,\"      \"],[11,\"button\",[]],[5,[\"action\"],[[28,[null]],[28,[\"ctx\",\"toggle\"]]]],[13],[0,\"Toggle!\"],[14],[0,\"\\n\"],[6,[\"component\"],[[28,[\"ctx\",\"content\"]]],null,{\"statements\":[[0,\"        \"],[11,\"span\",[]],[15,\"class\",\"content\"],[13],[0,\"Visible!\"],[14],[0,\"\\n\"]],\"locals\":[]},null],[0,\"\\n\"],[6,[\"if\"],[[28,[\"ctx\",\"toggled\"]]],null,{\"statements\":[[0,\"        \"],[11,\"span\",[]],[15,\"class\",\"if-toggled\"],[13],[0,\"Toggled!\"],[14],[0,\"\\n\"]],\"locals\":[]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.content').length, 0, 'the content is hidden');
    assert.equal(this.$('.if-toggled').length, 0, 'the content is hidden');

    this.$('button').click();

    assert.equal(this.$('.content').length, 1, 'the content is visible');
    assert.equal(this.$('.if-toggled').length, 1, 'the content is visible');

    this.$('button').click();

    assert.equal(this.$('.content').length, 0, 'the content is hidden');
    assert.equal(this.$('.if-toggled').length, 0, 'the content is hidden');
  });

  (0, _emberQunit.test)('the `button` and `content` components have the right aria settings', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "TgbhRGh8",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide\"],null,null,{\"statements\":[[6,[\"component\"],[[28,[\"ctx\",\"button\"]]],null,{\"statements\":[[0,\"        Button\\n\"]],\"locals\":[]},null],[0,\"\\n\"],[6,[\"component\"],[[28,[\"ctx\",\"content\"]]],[[\"class\"],[\"content\"]],{\"statements\":[[0,\"        Content\\n\"]],\"locals\":[]},null]],\"locals\":[\"ctx\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var controlsId = this.$((0, _emberHook.hook)('tta_show_hide_button')).attr('aria-controls');

    assert.ok(controlsId, 'the expand button has an aria controls attribute set');
    assert.ok(this.$('#' + controlsId).hasClass('content'), 'the id is of the content');
  });
});
define('dummy/tests/integration/components/tta-show-hide/expand-button-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-show-hide/expand-button', 'Integration | Component | tta show hide/expand button', {
    integration: true
  });

  (0, _emberQunit.test)('necessary aria roles are added to button element', function (assert) {
    this.set('toggled', false);

    this.render(Ember.HTMLBars.template({
      "id": "hl8WZVwS",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide/expand-button\"],null,[[\"toggled\",\"aria-controls\"],[[28,[\"toggled\"]],\"test-id\"]],{\"statements\":[[0,\"      Text\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('button').text().trim(), 'Text', 'button content is yielded');

    assert.equal(this.$('button').attr('aria-controls'), 'test-id', 'button has `aria-controls` attribute');
    assert.equal(this.$('button').attr('aria-expanded'), 'false', 'button has `aria-expanded` attribute');

    this.set('toggled', true);

    assert.equal(this.$('button').attr('aria-expanded'), 'true', '`aria-expanded` attribute updates based on state');
  });

  (0, _emberQunit.test)('icon class changes based on `toggled` state', function (assert) {
    this.set('toggled', false);

    this.render(Ember.HTMLBars.template({
      "id": "ufafG5SS",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide/expand-button\"],null,[[\"toggled\"],[[28,[\"toggled\"]]]],{\"statements\":[[0,\"      Text\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('.tf-direct-right').length, 1, 'icon pointing right is visible');

    this.set('toggled', true);

    assert.equal(this.$('.tf-direct-down').length, 1, 'icon pointing down is visible');
  });

  (0, _emberQunit.test)('click actions work by clicking on the button element', function (assert) {
    var stub = _sinon.default.stub();

    this.on('toggle', stub);

    this.render(Ember.HTMLBars.template({
      "id": "qz4EvyTy",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide/expand-button\"],null,[[\"toggle\"],[[33,[\"action\"],[[28,[null]],\"toggle\"],null]]],{\"statements\":[[0,\"      Text\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$('button').click();

    assert.equal(stub.callCount, 1, 'action triggered');
  });

  (0, _emberQunit.test)('click actions work by clicking on the containing element', function (assert) {
    var stub = _sinon.default.stub();

    this.on('toggle', stub);

    this.render(Ember.HTMLBars.template({
      "id": "bewhXvS5",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide/expand-button\"],null,[[\"class\",\"toggle\"],[\"click-me\",[33,[\"action\"],[[28,[null]],\"toggle\"],null]]],{\"statements\":[[0,\"      Text\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$('.click-me').click();

    assert.equal(stub.callCount, 1, 'action triggered');
  });
});
define('dummy/tests/integration/components/tta-show-hide/visible-content-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-show-hide/visible-content', 'Integration | Component | tta show hide/visible content', {
    integration: true
  });

  (0, _emberQunit.test)('it shows or hides content based on visible attribute', function (assert) {
    this.set('visible', false);

    this.render(Ember.HTMLBars.template({
      "id": "R5Ub881C",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-show-hide/visible-content\"],null,[[\"visible\"],[[28,[\"visible\"]]]],{\"statements\":[[0,\"      Visible\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    this.set('visible', true);

    assert.equal(this.$().text().trim(), 'Visible');
  });
});
define('dummy/tests/integration/components/tta-ticket-row-test', ['ember-metal/get', 'ember-metal/set', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'dummy/tests/helpers/responsive'], function (_get, _set, _emberQunit, _testModuleForEngine, _emberHook, _responsive) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-ticket-row', 'Integration | Component | tta ticket row', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('`tta-ticket-row` has class pointer when transferable', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "0cWYAwZY",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"transferable\"],[true]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok((0, _emberHook.$hook)('tta_ticket_row').hasClass('pointer'), 'has class');
  });

  (0, _emberQunit.test)('`tta-ticket-row` does not have class pointer when not transferable', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "BUr6mAt9",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"transferable\"],[false]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok(!(0, _emberHook.$hook)('tta_ticket_row').hasClass('pointer'), 'does not have class');
  });

  (0, _emberQunit.test)('`tta-ticket-row` does not have background-b5-10 class when the ticket is not selected', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "JxtZDJRS",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"selected\"],[false]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok(!(0, _emberHook.$hook)('tta_ticket_row').hasClass('background-b5-10'));
  });

  (0, _emberQunit.test)('`tta-ticket-row` has background-b5-10 class when the ticket is selected', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "qVs+py71",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"selected\"],[true]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok((0, _emberHook.$hook)('tta_ticket_row').hasClass('background-b5-10'));
  });

  (0, _emberQunit.test)('`tta-ticket-row` renders a checkbox if transferable', function (assert) {
    assert.expect(1);

    this.render(Ember.HTMLBars.template({
      "id": "0cWYAwZY",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"transferable\"],[true]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, 1, 'checkbox is rendered');
  });

  (0, _emberQunit.test)('`tta-ticket-row` does not render a checkbox if untransferable', function (assert) {
    assert.expect(1);

    this.set('ticket', { transfer: {} });
    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_checkbox').length, 0, 'checkbox not rendered');
  });

  (0, _emberQunit.test)('`tta-ticket-row` displays the correct status in desktop view', function (assert) {
    var _this = this;

    (0, _responsive.setBreakpointForIntegrationTest)(this, 'greaterThanMobile');
    var testCases = [{
      expectedResponse: '',
      transferState: {
        transferable: true
      },
      transfer: null
    }, {
      expectedResponse: 'Awaiting acceptance fromaaron.burr@notprez.com',
      transferState: {
        transferable: false
      },
      transfer: {
        isPending: true,
        recipient: {
          email: 'aaron.burr@notprez.com'
        }
      }
    }, {
      expectedResponse: 'Transferred toaaron.burr@notprez.com',
      transferState: {
        transferable: false
      },
      transfer: {
        isPending: false,
        recipient: {
          email: 'aaron.burr@notprez.com'
        }
      }
    }, {
      expectedResponse: 'Transfer feature disabled',
      transferState: {
        transferable: false
      }
    }, {
      expectedResponse: 'Scanned',
      transferState: {
        transferable: false,
        description: 'Scanned'
      },
      transfer: {
        isCancelled: true
      }
    }];

    assert.expect(testCases.length);

    // In desktop view, the transfer column is a sibiling to the description
    var selector = (0, _emberHook.hook)('tta_ticket_row_description_column') + ' + ' + (0, _emberHook.hook)('tta_ticket_row_transfer_column') + ' > ' + (0, _emberHook.hook)('tta_ticket_row_transfer_status');

    testCases.forEach(function (ticket) {
      _this.set('ticket', ticket);

      _this.render(Ember.HTMLBars.template({
        "id": "Fduhcxo/",
        "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\",\"media\"],[[28,[\"ticket\"]],[28,[\"media\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
        "meta": {}
      }));
      assert.equal(_this.$(selector).text().trim(), (0, _get.default)(ticket, 'expectedResponse'), 'transferable status is correct');
    });
  });

  (0, _emberQunit.test)('`tta-ticket-row` displays the correct status in mobile view', function (assert) {
    var _this2 = this;

    (0, _responsive.setBreakpointForIntegrationTest)(this, 'mobile');
    var testCases = [{
      expectedResponse: '',
      transferState: {
        transferable: true
      },
      transfer: null
    }, {
      expectedResponse: 'Awaiting acceptance fromaaron.burr@notprez.com',
      transferState: {
        transferable: false
      },
      transfer: {
        isPending: true,
        recipient: {
          email: 'aaron.burr@notprez.com'
        }
      }
    }, {
      expectedResponse: 'Transferred toaaron.burr@notprez.com',
      transferState: {
        transferable: false
      },
      transfer: {
        isPending: false,
        recipient: {
          email: 'aaron.burr@notprez.com'
        }
      }
    }, {
      expectedResponse: 'Transfer feature disabled',
      transferState: {
        transferable: false
      }
    }];

    assert.expect(testCases.length);

    // In desktop view, the transfer column is a descendant to the description
    var selector = (0, _emberHook.hook)('tta_ticket_row_description_column') + ' > ' + (0, _emberHook.hook)('tta_ticket_row_transfer_column') + ' > ' + (0, _emberHook.hook)('tta_ticket_row_transfer_status');

    testCases.forEach(function (ticket) {
      _this2.set('ticket', ticket);

      _this2.render(Ember.HTMLBars.template({
        "id": "Fduhcxo/",
        "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\",\"media\"],[[28,[\"ticket\"]],[28,[\"media\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
        "meta": {}
      }));
      assert.equal(_this2.$(selector).text().trim(), (0, _get.default)(ticket, 'expectedResponse'), 'transferable status is correct');
    });
  });

  (0, _emberQunit.test)('`tta-ticket-row` triggers `toggleSelect` if it is transferable', function (assert) {
    assert.expect(1);

    var ticket = {
      transfer: null,
      transferState: {
        transferable: true
      }
    };

    (0, _set.setProperties)(this, {
      ticket: ticket,
      actions: {
        toggleSelect: function toggleSelect() {
          assert.ok(true, 'is clickable');
        }
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "C1OZwjLM",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\",\"toggleSelect\"],[[28,[\"ticket\"]],[33,[\"action\"],[[28,[null]],\"toggleSelect\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    (0, _emberHook.$hook)('tta_ticket_row').click();
  });

  (0, _emberQunit.test)('`tta-ticket-row` does not trigger `toggleSelect` if it is not transferable', function (assert) {
    assert.expect(0);

    var ticket = {
      transfer: {}
    };

    (0, _set.setProperties)(this, {
      ticket: ticket,
      actions: {
        toggleSelect: function toggleSelect() {
          assert.ok(false, 'is clickable');
        }
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "C1OZwjLM",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\",\"toggleSelect\"],[[28,[\"ticket\"]],[33,[\"action\"],[[28,[null]],\"toggleSelect\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    (0, _emberHook.$hook)('tta_ticket_row').click();
  });

  (0, _emberQunit.test)('the ticket `variantName` is displayed', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { variantName: 'foo' });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_variant_description').text().trim(), 'foo', 'text is correct');
  });

  (0, _emberQunit.test)('the ticket `sectionDetails` is displayed', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { properties: { section: 'foo', row: 'bar', seat: 'baz' }, variantName: 'Reserved' });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_section_details').text().trim(), 'Section foo · Row bar · Seat baz', 'correct text');
  });

  (0, _emberQunit.test)('the ticket `sectionDetails` is displayed, even if only some info is provided', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { properties: { section: 'foo' }, variantName: 'General Admission' });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_section_details').text().trim(), 'Section foo', 'correct text');
  });

  (0, _emberQunit.test)('the ticket `sectionDetails` is not displayed if there are is no section, row, or seat', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { variantName: 'General Admission' });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_section_details').length, 0, 'sectionDetails not rendered');
  });

  (0, _emberQunit.test)('the last 4 digits of the ticket `code` is displayed', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { code: '1234567890' });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_code').text().trim(), 'Barcode: ******7890', 'text is correct');
  });

  (0, _emberQunit.test)('the ticket row is faded out if the ticket is transfered', function (assert) {
    (0, _responsive.setBreakpointForIntegrationTest)(this, 'greaterThanMobile');
    assert.expect(4);

    this.set('ticket', {
      transferState: { transferable: false },
      transfer: { isTransferred: true }
    });

    this.render(Ember.HTMLBars.template({
      "id": "Fduhcxo/",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\",\"media\"],[[28,[\"ticket\"]],[28,[\"media\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok((0, _emberHook.$hook)('tta_ticket_row_description_column').hasClass('opacity-05'));
    assert.ok((0, _emberHook.$hook)('tta_ticket_row_transfer_column').hasClass('opacity-05'));

    this.set('ticket', {
      transferState: { transferable: false },
      transfer: { isTransferred: false }
    });

    assert.ok(!(0, _emberHook.$hook)('tta_ticket_row_description_column').hasClass('opacity-05'));
    assert.ok(!(0, _emberHook.$hook)('tta_ticket_row_transfer_column').hasClass('opacity-05'));
  });

  (0, _emberQunit.test)('the ticket `code` is not displayed when it doesn\'t exist in the ticket', function (assert) {
    assert.expect(1);

    (0, _set.default)(this, 'ticket', { code: null });

    this.render(Ember.HTMLBars.template({
      "id": "WVh7yFUq",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-row\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_code').length, 0, 'no code is displayed');
  });
});
define('dummy/tests/integration/components/tta-ticket-status-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-ticket-status', 'Integration | Component | tta ticket status', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it renders shows status', function (assert) {
    this.set('ticket', {
      transferState: {
        description: 'Pending'
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "xE5Eiipg",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-status\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_transfer_status').text().trim(), 'Pending', 'the text is rendered');
  });

  (0, _emberQunit.test)('it optionally renders the cancel link if canceleable', function (assert) {
    this.set('ticket', {
      transfer: {
        isCancelable: false
      }
    });

    this.render(Ember.HTMLBars.template({
      "id": "xE5Eiipg",
      "block": "{\"statements\":[[1,[33,[\"tta-ticket-status\"],null,[[\"ticket\"],[[28,[\"ticket\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_cancel').length, 0, 'cancel is not visible');

    this.set('ticket', {
      transfer: {
        isCancelable: true
      }
    });

    assert.equal((0, _emberHook.$hook)('tta_ticket_row_cancel').length, 1, 'cancel is visible');
  });
});
define('dummy/tests/integration/components/tta-toasts-test', ['ember-owner/get', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_get, _emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-toasts', 'Integration | Component | tta toasts', {
    integration: true,
    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
      var typesUsed = ['danger'];
      this.flashMessages = (0, _get.default)(this).lookup('service:flash-messages');
      this.flashMessages.registerTypes(typesUsed);
    }
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "lRZ1BqT4",
      "block": "{\"statements\":[[1,[26,[\"tta-toasts\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_toast')).length, 0, 'there are no toasts yet');
  });
});
define('dummy/tests/integration/components/tta-topbar-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberHook, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-topbar', 'Integration | Component | tta topbar', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it yields title and action components', function (assert) {
    var action = _sinon.default.stub();
    this.on('action', action);

    this.render(Ember.HTMLBars.template({
      "id": "2CXCty4c",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-topbar\"],null,null,{\"statements\":[[0,\"      \"],[6,[\"component\"],[[28,[\"bar\",\"title\"]]],null,{\"statements\":[[0,\"foo\"]],\"locals\":[]},null],[0,\"\\n\"],[6,[\"component\"],[[28,[\"bar\",\"action\"]]],[[\"action\"],[[33,[\"action\"],[[28,[null]],\"action\"],null]]],{\"statements\":[[0,\"        bar\\n\"]],\"locals\":[]},null]],\"locals\":[\"bar\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var $actionElement = this.$((0, _emberHook.hook)('tta_top_bar_action'));

    assert.equal(this.$((0, _emberHook.hook)('tta_title')).text().trim(), 'foo', 'yields content into top bar title');
    assert.equal($actionElement.text().trim(), 'bar', 'yields content into action component');

    $actionElement.click();

    assert.equal(action.callCount, 1, 'the action was triggered once');
  });

  (0, _emberQunit.test)('it yields title and action components, inline style', function (assert) {
    var action = _sinon.default.stub();
    this.on('action', action);

    this.render(Ember.HTMLBars.template({
      "id": "tk3ifiv1",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-topbar\"],null,null,{\"statements\":[[0,\"      \"],[1,[33,[\"component\"],[[28,[\"bar\",\"title\"]],\"foo\"],null],false],[0,\"\\n      \"],[1,[33,[\"component\"],[[28,[\"bar\",\"action\"]],\"bar\"],[[\"action\"],[[33,[\"action\"],[[28,[null]],\"action\"],null]]]],false],[0,\"\\n\"]],\"locals\":[\"bar\"]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var $actionElement = this.$((0, _emberHook.hook)('tta_top_bar_action'));

    assert.equal(this.$((0, _emberHook.hook)('tta_title')).text().trim(), 'foo', 'yields content into top bar title');
    assert.equal($actionElement.text().trim(), 'bar', 'yields content into action component');

    $actionElement.click();

    assert.equal(action.callCount, 1, 'the action was triggered once');
  });
});
define('dummy/tests/integration/components/tta-topbar/bar-action-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberHook, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-topbar/bar-action', 'Integration | Component | tta topbar/bar action', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it properly triggers the provided action', function (assert) {
    var action = _sinon.default.stub();
    this.on('action', action);

    this.render(Ember.HTMLBars.template({
      "id": "iDuEor5m",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-topbar/bar-action\"],null,[[\"action\"],[[33,[\"action\"],[[28,[null]],\"action\"],null]]],{\"statements\":[[0,\"      Return to Other Thing\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var $element = this.$((0, _emberHook.hook)('tta_top_bar_action'));

    assert.equal($element.text().trim(), 'Return to Other Thing', 'the text is rendered');

    $element.click();

    assert.equal(action.callCount, 1, 'the action was triggered once');

    $element.find('a').click();

    assert.equal(action.callCount, 2, 'the action was triggered a second time');
  });

  (0, _emberQunit.test)('it properly triggers the provided action, inline version', function (assert) {
    var action = _sinon.default.stub();
    this.on('action', action);

    this.render(Ember.HTMLBars.template({
      "id": "p3G1TTkX",
      "block": "{\"statements\":[[0,\"\\n    \"],[1,[33,[\"tta-topbar/bar-action\"],[\"Return to Other Thing\"],[[\"action\"],[[33,[\"action\"],[[28,[null]],\"action\"],null]]]],false],[0,\"\\n  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    var $element = this.$((0, _emberHook.hook)('tta_top_bar_action'));

    assert.equal($element.text().trim(), 'Return to Other Thing');

    $element.click();

    assert.equal(action.callCount, 1, 'the action was triggered once');

    $element.find('a').click();

    assert.equal(action.callCount, 2, 'the action was triggered a second time');
  });
});
define('dummy/tests/integration/components/tta-topbar/bar-title-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-topbar/bar-title', 'Integration | Component | tta topbar/bar title', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  (0, _emberQunit.test)('it yields the title', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "/7QOjfyX",
      "block": "{\"statements\":[[0,\"\\n\"],[6,[\"tta-topbar/bar-title\"],null,null,{\"statements\":[[0,\"      Title\\n\"]],\"locals\":[]},null],[0,\"  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_title')).text().trim(), 'Title');
  });

  (0, _emberQunit.test)('it also supports an inline version', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "4QbWMNI6",
      "block": "{\"statements\":[[0,\"\\n    \"],[1,[33,[\"tta-topbar/bar-title\"],[\"Title\"],null],false],[0,\"\\n  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_title')).text().trim(), 'Title');
  });
});
define('dummy/tests/integration/components/tta-transfer-error-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook'], function (_emberQunit, _testModuleForEngine, _emberHook) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-transfer-error', 'Integration | Component | tta transfer error', {
    integration: true
  });

  (0, _emberQunit.test)('it renders the icon and text', function (assert) {
    this.render(Ember.HTMLBars.template({
      "id": "cDOzTkVX",
      "block": "{\"statements\":[[1,[26,[\"tta-transfer-error\"]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_error_icon')).length, 'there is an icon');
    assert.equal(this.$((0, _emberHook.hook)('tta_transfer_error_text')).text().trim(), 'No transferable tickets found.');
  });
});
define('dummy/tests/integration/components/tta-transfer-test', ['ember-array/utils', 'ember-runloop', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'sinon'], function (_utils, _emberRunloop, _emberQunit, _testModuleForEngine, _emberHook, _sinon) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var Promise = RSVP.Promise;


  (0, _testModuleForEngine.moduleForComponent)('tta-transfer', 'Integration | Component | tta transfer', {
    integration: true,

    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
    }
  });

  var tickets = (0, _utils.A)([{
    transferState: {
      transferable: true
    }
  }, {
    transferState: {
      transferable: true
    }
  }]);

  (0, _emberQunit.test)('the transfer button is only enabled if at least one ticket is selected, and a valid email is provided', function (assert) {
    assert.expect(6);

    this.set('tickets', tickets);

    this.render(Ember.HTMLBars.template({
      "id": "39XMRLPW",
      "block": "{\"statements\":[[1,[33,[\"tta-transfer\"],null,[[\"tickets\"],[[28,[\"tickets\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'disabled when no terms, no tickets, no email');

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'disabled when no tickets, no email');
    this.$((0, _emberHook.hook)('tta_ticket_row')).first().click();

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'disabled when no email');
    this.$((0, _emberHook.hook)('tta_validating_input')).val('foo').trigger('change');

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'disabled when invalid email');
    this.$((0, _emberHook.hook)('tta_validating_input')).val('foo@bar.baz').trigger('change');

    assert.ok(!this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'enabled when terms, tickets, and valid email');
    this.$((0, _emberHook.hook)('tta_ticket_row')).first().click();

    assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'disabled when no tickets');
  });

  (0, _emberQunit.test)('a warning is provided if the tries to send tickets to themself', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var input;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              this.set('tickets', tickets);
              this.set('user', {
                email: 'foo@bar.baz'
              });

              this.render(Ember.HTMLBars.template({
                "id": "E7M0aGCN",
                "block": "{\"statements\":[[1,[33,[\"tta-transfer\"],null,[[\"tickets\",\"user\"],[[28,[\"tickets\"]],[28,[\"user\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
                "meta": {}
              }));

              this.$((0, _emberHook.hook)('tta_ticket_row')).first().click();

              input = this.$((0, _emberHook.hook)('tta_validating_input'));


              input.val('foo@bar.baz').trigger('change').trigger('blur');

              assert.ok(this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'transfer still disabled');
              assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).length, 1, 'there is a validation error');

              input.val('foo2@bar.baz').trigger('change');

              assert.ok(!this.$((0, _emberHook.hook)('tta_transfer_button')).attr('disabled'), 'transfer re-enabled after different email');

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('click the transfer button triggers the `submit-transfer` action', function (assert) {
    assert.expect(1);

    var stub = _sinon.default.stub();

    this.on('transfer', stub);
    this.set('tickets', tickets);

    this.render(Ember.HTMLBars.template({
      "id": "DpYWLQB4",
      "block": "{\"statements\":[[1,[33,[\"tta-transfer\"],null,[[\"tickets\",\"submit-transfer\"],[[28,[\"tickets\"]],[33,[\"action\"],[[28,[null]],\"transfer\"],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    this.$((0, _emberHook.hook)('tta_transfer_terms')).find('input').click();
    this.$((0, _emberHook.hook)('tta_ticket_row')).first().click();
    this.$((0, _emberHook.hook)('tta_validating_input')).val('foo@bar.baz').trigger('change');

    this.$((0, _emberHook.hook)('tta_transfer_button')).click();

    assert.equal(stub.callCount, 1, 'the action was called');
  });

  (0, _emberQunit.test)('it is promise aware and shows loading states', function (assert) {
    var _this = this;

    var resolveTickets = void 0,
        resolveEvent = void 0;
    var done = assert.async();

    this.set('model', {
      tickets: new Promise(function (resolve) {
        return resolveTickets = resolve;
      }),
      event: new Promise(function (resolve) {
        return resolveEvent = resolve;
      })
    });

    this.render(Ember.HTMLBars.template({
      "id": "DCiQmZpa",
      "block": "{\"statements\":[[1,[33,[\"tta-transfer\"],null,[[\"tickets\",\"event\"],[[28,[\"model\",\"tickets\"]],[28,[\"model\",\"event\"]]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.ok(this.$((0, _emberHook.hook)('tta_event_table', { isLoading: true })).length, 'the loading state is visible');

    resolveTickets(tickets);
    resolveEvent({});

    // Next Tick lets the concurrency task resolve
    (0, _emberRunloop.next)(function () {
      // And lets the animation complete.
      (0, _emberRunloop.next)(function () {
        assert.ok(_this.$((0, _emberHook.hook)('tta_event_table', { isLoading: false })).length, 'the loading state is gone');
        done();
      });
    });
  });
});
define('dummy/tests/integration/components/tta-validating-input-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-hook', 'ember-keyboard', 'sinon'], function (_emberQunit, _testModuleForEngine, _emberHook, _emberKeyboard, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleForComponent)('tta-validating-input', 'Integration | Component | tta validating input', {
    integration: true,
    beforeEach: function beforeEach() {
      (0, _emberHook.initialize)();
      (0, _emberKeyboard.initialize)();
    }
  });

  (0, _emberQunit.test)('the on-update action works', function (assert) {
    assert.expect(3);

    this.set('action', _sinon.default.stub());
    this.render(Ember.HTMLBars.template({
      "id": "uwSpceMh",
      "block": "{\"statements\":[[1,[33,[\"tta-validating-input\"],null,[[\"on-update\"],[[33,[\"action\"],[[28,[null]],[28,[\"action\"]]],null]]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$('input[type=text]').length, 1);

    this.$((0, _emberHook.hook)('tta_validating_input')).val('Alexander');
    this.$((0, _emberHook.hook)('tta_validating_input')).trigger('keyup');

    assert.equal(this.get('action').callCount, 1, 'action on triggered once');
    assert.ok(this.get('action').getCall(0).calledWithExactly('Alexander'));
  });

  (0, _emberQunit.test)('it shows validation error only after each field is entered', function (assert) {
    this.set('isValid', false);
    this.render(Ember.HTMLBars.template({
      "id": "eKCW9K/W",
      "block": "{\"statements\":[[1,[33,[\"tta-validating-input\"],null,[[\"isValid\",\"error-message\"],[[28,[\"isValid\"]],\"Error!\"]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).text().trim(), '', 'error message not visible');

    this.$((0, _emberHook.hook)('tta_validating_input')).trigger('blur');

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');

    this.set('isValid', true);

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
  });

  (0, _emberQunit.test)('immediately shows validation error if provided', function (assert) {
    this.set('isValid', false);
    this.render(Ember.HTMLBars.template({
      "id": "IpbvI1eR",
      "block": "{\"statements\":[[1,[33,[\"tta-validating-input\"],null,[[\"isValid\",\"error-message\",\"validateImmediately\"],[[28,[\"isValid\"]],\"Error!\",true]]],false]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');

    this.set('isValid', true);

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
  });

  (0, _emberQunit.test)('the `insert-newline` action is forwarded', function (assert) {
    this.set('isValid', false);
    this.set('action', _sinon.default.stub());

    this.render(Ember.HTMLBars.template({
      "id": "FGSzqpj1",
      "block": "{\"statements\":[[0,\"\\n    \"],[1,[33,[\"tta-validating-input\"],null,[[\"insert-newline\",\"isValid\",\"error-message\"],[[33,[\"action\"],[[28,[null]],[28,[\"action\"]]],null],[28,[\"isValid\"]],\"Error!\"]]],false],[0,\"\\n  \"]],\"locals\":[],\"named\":[],\"yields\":[],\"hasPartials\":false}",
      "meta": {}
    }));

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 0, 'name not marked invalid');
    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).text().trim(), '', 'error message not visible');

    var input = (0, _emberHook.hook)('tta_validating_input');
    (0, _emberKeyboard.triggerKeyUp)('Enter', input);

    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input', { invalid: true })).length, 1, 'name marked invalid');
    assert.equal(this.$((0, _emberHook.hook)('tta_validating_input_error')).text().trim(), 'Error!', 'error message visible');
    assert.equal(this.get('action').callCount, 1, 'insert-newline action called');
  });
});
define('dummy/tests/integration/models/marketing-membership-test', ['ember-metal/get', 'ember-metal/set', 'dummy/tests/helpers/module-for-integration', 'dummy/tests/helpers/setup-mirage-for-integration', 'ember-runloop'], function (_get, _set, _moduleForIntegration, _setupMirageForIntegration, _emberRunloop) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _moduleForIntegration.moduleForIntegration)('Integration | Model | marketing membership', {
    beforeEach: function beforeEach() {
      this.store = this.container.lookup('service:store');

      this.register('service:session', {
        authorize: function authorize(authorizer, block) {
          block('Authorization', 'Bearer 1234-3456-5678');
        }
      }, { instantiate: false });

      (0, _setupMirageForIntegration.default)(this.container);
    },
    afterEach: function afterEach() {
      server.shutdown();
    }
  });

  (0, _moduleForIntegration.test)('can fetch and save a membership', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var mirageMembership, membershipArray, membership;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              mirageMembership = server.create('marketing-membership', {
                emailSubscription: false
              });
              _context.next = 3;
              return this.store.query('marketing-membership', {
                userId: mirageMembership.userId,
                orgId: mirageMembership.orgId
              });

            case 3:
              membershipArray = _context.sent;
              membership = (0, _get.default)(membershipArray, 'firstObject');


              assert.deepEqual((0, _get.default)(membership, 'id'), mirageMembership.id);

              _context.next = 8;
              return (0, _emberRunloop.default)(function () {
                (0, _set.default)(membership, 'emailSubscription', true);
                return membership.save();
              });

            case 8:

              assert.ok(server.db.marketingMemberships.find(mirageMembership.id).emailSubscription, 'membership was saved');

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('can create and save a membership', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var _this = this;

      var membership, _server$db$marketingM, _server$db$marketingM2, dbMembership;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return (0, _emberRunloop.default)(function () {
                return _this.store.createRecord('marketing-membership', {
                  orgId: '1234',
                  userId: '1234',
                  emailSubscription: false
                }).save();
              });

            case 2:
              membership = _context2.sent;
              _server$db$marketingM = server.db.marketingMemberships.where({
                orgId: '1234',
                userId: '1234'
              }), _server$db$marketingM2 = _slicedToArray(_server$db$marketingM, 1), dbMembership = _server$db$marketingM2[0];


              assert.equal(dbMembership.orgId, (0, _get.default)(membership, 'orgId'));
              assert.equal(dbMembership.emailSubscription, (0, _get.default)(membership, 'emailSubscription'));

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define('dummy/tests/integration/models/tickets-test', ['ember-runloop', 'ember-metal/get', 'dummy/mirage/scenarios/create-order', 'dummy/tests/helpers/module-for-integration', 'dummy/tests/helpers/setup-mirage-for-integration'], function (_emberRunloop, _get, _createOrder3, _moduleForIntegration, _setupMirageForIntegration) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _moduleForIntegration.moduleForIntegration)('Integration | Model | tickets', {
    beforeEach: function beforeEach() {
      this.store = this.container.lookup('service:store');

      this.register('service:session', {
        authorize: function authorize(authorizer, block) {
          block('Authorization', 'Bearer 1234-3456-5678');
        }
      }, { instantiate: false });

      (0, _setupMirageForIntegration.default)(this.container);
    },
    afterEach: function afterEach() {
      server.shutdown();
    }
  });

  (0, _moduleForIntegration.test)('can create a ticket-transfer', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var _createOrder, _createOrder$tickets, orderId, tickets, transfer, _transfer$hasMany$ids, _transfer$hasMany$ids2, ticketId, refreshedTickets;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _createOrder = (0, _createOrder3.default)(server), _createOrder$tickets = _slicedToArray(_createOrder.tickets, 1), orderId = _createOrder$tickets[0].orderId;
              _context.next = 3;
              return this.store.query('ticket', { orderId: orderId });

            case 3:
              tickets = _context.sent;
              transfer = (0, _emberRunloop.default)(this.store, 'createRecord', 'ticket-transfer', { tickets: tickets });
              _transfer$hasMany$ids = transfer.hasMany('tickets').ids(), _transfer$hasMany$ids2 = _slicedToArray(_transfer$hasMany$ids, 1), ticketId = _transfer$hasMany$ids2[0];

              assert.ok(ticketId, 'the transfer has some tickets');
              assert.ok(this.store.peekRecord('ticket', ticketId), 'the ticket has a transfer');

              _context.next = 10;
              return (0, _emberRunloop.default)(transfer, 'save');

            case 10:

              (0, _emberRunloop.default)(this.store, 'unloadAll');

              _context.next = 13;
              return this.store.query('ticket', { orderId: orderId });

            case 13:
              refreshedTickets = _context.sent;


              assert.ok((0, _get.default)(refreshedTickets, 'firstObject').belongsTo('transfer').id(), 'ticket has a transfer still');

            case 15:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('fetching tickets that already have transfers shows them', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var _createOrder2, _createOrder2$tickets, orderId, tickets, ticket;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _createOrder2 = (0, _createOrder3.default)(server, {
                ticketTraits: ['hasTransfer']
              }), _createOrder2$tickets = _slicedToArray(_createOrder2.tickets, 1), orderId = _createOrder2$tickets[0].orderId;
              _context2.next = 3;
              return this.store.query('ticket', { orderId: orderId });

            case 3:
              tickets = _context2.sent;
              ticket = (0, _get.default)(tickets, 'firstObject');


              assert.ok((0, _get.default)(ticket, 'transfer'), 'the ticket has a transfer');
              assert.ok((0, _get.default)(ticket, 'transfer.recipient.email'), 'the ticket has a recipient');
              assert.ok((0, _get.default)(ticket, 'transferState.description'), 'there is a description too');

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define('dummy/tests/integration/models/transfer-test', ['ember-runloop', 'ember-metal/get', 'ember-metal/set', 'dummy/mirage/scenarios/create-transfer', 'dummy/tests/helpers/module-for-integration', 'dummy/tests/helpers/setup-mirage-for-integration'], function (_emberRunloop, _get, _set, _createTransfer5, _moduleForIntegration, _setupMirageForIntegration) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _moduleForIntegration.moduleForIntegration)('Integration | Model | ticket-transfer', {
    beforeEach: function beforeEach() {
      this.store = this.container.lookup('service:store');
      (0, _setupMirageForIntegration.default)(this.container);
    },
    afterEach: function afterEach() {
      server.shutdown();
    }
  });

  (0, _moduleForIntegration.test)('can accept all tickets for a transfer', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var _createTransfer, _createTransfer$trans, id, acceptanceToken, tickets, transfer;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _createTransfer = (0, _createTransfer5.default)(server), _createTransfer$trans = _createTransfer.transfer, id = _createTransfer$trans.id, acceptanceToken = _createTransfer$trans.acceptanceToken, tickets = _createTransfer.tickets;
              _context.next = 3;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 3:
              transfer = _context.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

              (0, _emberRunloop.default)(null, _set.default, transfer, 'status', 'ACCEPTED');

              _context.next = 9;
              return (0, _emberRunloop.default)(transfer, 'save');

            case 9:
              (0, _emberRunloop.default)(this.store, 'unloadAll');

              _context.next = 12;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 12:
              transfer = _context.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'status'), 'ACCEPTED', 'transfer state is updated');
              assert.equal((0, _get.default)(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

            case 16:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('can accept some tickets for a transfer', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var _createTransfer2, _createTransfer2$tran, id, acceptanceToken, tickets, transfer, lastTicket;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _createTransfer2 = (0, _createTransfer5.default)(server), _createTransfer2$tran = _createTransfer2.transfer, id = _createTransfer2$tran.id, acceptanceToken = _createTransfer2$tran.acceptanceToken, tickets = _createTransfer2.tickets;
              _context2.next = 3;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 3:
              transfer = _context2.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

              lastTicket = (0, _get.default)(transfer, 'tickets.lastObject');

              (0, _emberRunloop.default)((0, _get.default)(transfer, 'tickets'), 'removeObject', lastTicket);
              (0, _emberRunloop.default)(null, _set.default, transfer, 'status', 'ACCEPTED');

              _context2.next = 11;
              return (0, _emberRunloop.default)(transfer, 'save');

            case 11:
              (0, _emberRunloop.default)(this.store, 'unloadAll');

              _context2.next = 14;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 14:
              transfer = _context2.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'status'), 'ACCEPTED', 'transfer state is updated');
              assert.equal((0, _get.default)(transfer, 'tickets.length'), tickets.length - 1, 'tickets were loaded into the store');

            case 18:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('can accept no tickets for a transfer', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(assert) {
      var _createTransfer3, _createTransfer3$tran, id, acceptanceToken, tickets, transfer;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _createTransfer3 = (0, _createTransfer5.default)(server), _createTransfer3$tran = _createTransfer3.transfer, id = _createTransfer3$tran.id, acceptanceToken = _createTransfer3$tran.acceptanceToken, tickets = _createTransfer3.tickets;
              _context3.next = 3;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 3:
              transfer = _context3.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'tickets.length'), tickets.length, 'tickets were loaded into the store');

              (0, _emberRunloop.default)(null, _set.default, transfer, 'tickets', []);
              (0, _emberRunloop.default)(null, _set.default, transfer, 'status', 'REJECTED');

              _context3.next = 10;
              return (0, _emberRunloop.default)(transfer, 'save');

            case 10:
              (0, _emberRunloop.default)(this.store, 'unloadAll');

              _context3.next = 13;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 13:
              transfer = _context3.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);
              assert.equal((0, _get.default)(transfer, 'status'), 'REJECTED', 'transfer state is updated');
              assert.equal((0, _get.default)(transfer, 'tickets.length'), 0, 'tickets were loaded into the store');

            case 17:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('the `acceptableStatus` is fetched', function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(assert) {
      var _createTransfer4, _createTransfer4$tran, id, acceptanceToken, transfer;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _createTransfer4 = (0, _createTransfer5.default)(server, {
                transferTraits: ['notAcceptableStatus']
              }), _createTransfer4$tran = _createTransfer4.transfer, id = _createTransfer4$tran.id, acceptanceToken = _createTransfer4$tran.acceptanceToken;
              _context4.next = 3;
              return (0, _emberRunloop.default)(this.store, 'queryRecord', 'ticket-transfer', { id: id, acceptanceToken: acceptanceToken });

            case 3:
              transfer = _context4.sent;


              assert.equal((0, _get.default)(transfer, 'id'), id);

              assert.deepEqual((0, _get.default)(transfer, 'acceptanceState'), {
                acceptable: false,
                description: 'Invalid / Scanned'
              });

            case 6:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }());
});
define('dummy/tests/integration/models/user-test', ['ember-metal/get', 'dummy/tests/helpers/module-for-integration', 'dummy/tests/helpers/setup-mirage-for-integration', 'ember-runloop'], function (_get, _moduleForIntegration, _setupMirageForIntegration, _emberRunloop) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  (0, _moduleForIntegration.moduleForIntegration)('Integration | Model | user', {
    beforeEach: function beforeEach() {
      this.store = this.container.lookup('service:store');

      this.register('service:session', {
        authorize: function authorize(authorizer, block) {
          block('Authorization', 'Bearer 1234-3456-5678');
        }
      }, { instantiate: false });

      (0, _setupMirageForIntegration.default)(this.container);
    },
    afterEach: function afterEach() {
      server.shutdown();
    }
  });

  (0, _moduleForIntegration.test)('can fetch the current user', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var mirageUser, user;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              mirageUser = server.create('user', {
                _authToken: '1234-3456-5678'
              });
              _context.next = 3;
              return this.store.queryRecord('user', { me: true });

            case 3:
              user = _context.sent;

              assert.deepEqual((0, _get.default)(user, 'id'), mirageUser.id);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _moduleForIntegration.test)('can save the user firstName lastName', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var _this = this;

      var user, _server$db$users$wher, _server$db$users$wher2, dbUser;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              server.create('user', {
                _authToken: '1234-3456-5678'
              });

              _context2.next = 3;
              return (0, _emberRunloop.default)(function () {
                return _this.store.queryRecord('user', { me: true });
              });

            case 3:
              user = _context2.sent;
              _context2.next = 6;
              return (0, _emberRunloop.default)(function () {
                user.set('firstName', 'Spencer');
                user.set('lastName', 'Price');
                return user.save();
              });

            case 6:
              _server$db$users$wher = server.db.users.where({
                firstName: 'Spencer',
                lastName: 'Price'
              }), _server$db$users$wher2 = _slicedToArray(_server$db$users$wher, 1), dbUser = _server$db$users$wher2[0];


              assert.equal(dbUser.firstName, (0, _get.default)(user, 'firstName'));
              assert.equal(dbUser.lastName, (0, _get.default)(user, 'lastName'));

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define("dummy/tests/template-deprecations-test", [], function () {
  "use strict";
});
define('dummy/tests/test-helper', ['dummy/tests/helpers/resolver', 'ember-qunit', 'ember-cli-qunit', 'dummy/tests/helpers/flash-message'], function (_resolver, _emberQunit, _emberCliQunit) {
  'use strict';

  (0, _emberQunit.setResolver)(_resolver.default);
  (0, _emberCliQunit.start)();
});
define('dummy/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('acceptance/accept-flow-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/accept-flow-test.js should pass ESLint\n\n');
  });

  QUnit.test('acceptance/tta-flow-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/tta-flow-test.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/destroy-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/flash-message.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/flash-message.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-acceptance.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-integration.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-integration.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/responsive.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/responsive.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/setup-mirage-for-integration.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/setup-mirage-for-integration.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/start-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/test-module-for-engine.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/test-module-for-engine.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-accept-completed-tickets-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-accept-completed-tickets-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-accept-header-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-accept-header-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-accept-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-accept-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-accept-ticket-row-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-accept-ticket-row-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-block-body-scroll-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-block-body-scroll-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-confirmation-modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-confirmation-modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-event-info-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-event-info-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-grouped-tickets-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-grouped-tickets-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-if-resolved-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-if-resolved-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-personal-message-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-personal-message-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-same-user-modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-same-user-modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-selected-list-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-selected-list-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-show-hide-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-show-hide-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-show-hide/expand-button-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-show-hide/expand-button-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-show-hide/visible-content-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-show-hide/visible-content-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-ticket-row-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-ticket-row-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-ticket-status-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-ticket-status-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-toasts-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-toasts-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-topbar-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-topbar-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-topbar/bar-action-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-topbar/bar-action-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-topbar/bar-title-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-topbar/bar-title-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-transfer-error-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-transfer-error-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-transfer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-transfer-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/tta-validating-input-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/tta-validating-input-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/models/marketing-membership-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/models/marketing-membership-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/models/tickets-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/models/tickets-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/models/transfer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/models/transfer-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/models/user-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/models/user-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/marketing-membership-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/marketing-membership-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/ticket-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/ticket-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/ticket-transfer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/ticket-transfer-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/adapters/user-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/adapters/user-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/accept/confirm-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/accept/confirm-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/new-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/new-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/new/modal/cancel-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/new/modal/cancel-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/new/modal/confirm-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/new/modal/confirm-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/array-copy-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/array-copy-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/barcode-obfuscator-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/barcode-obfuscator-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/line-breaker-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/line-breaker-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/tta-inc-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/tta-inc-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/tta-section-details-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/tta-section-details-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/helpers/tta-transfer-state-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/helpers/tta-transfer-state-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/mixins/new-transfer-state-model-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/mixins/new-transfer-state-model-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/event-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/event-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/marketing-membership-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/marketing-membership-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/ticket-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/ticket-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/ticket-transfer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/ticket-transfer-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/user-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/user-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/accept-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/accept-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/accept/confirm-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/accept/confirm-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/accept/confirm/terms-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/accept/confirm/terms-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/accept/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/accept/index-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/accept/success-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/accept/success-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal/cancel-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal/cancel-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal/confirm-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal/confirm-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal/index-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal/success-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal/success-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/new/modal/terms-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/new/modal/terms-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/application-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/application-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/event-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/event-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/marketing-membership-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/marketing-membership-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/ticket-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/ticket-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/ticket-transfer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/ticket-transfer-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/serializers/user-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/serializers/user-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/transfers-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/transfers-test.js should pass ESLint\n\n');
  });
});
define('dummy/tests/unit/adapters/application-test', ['ember-metal/get', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_get, _emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('adapter:application', 'Unit | Adapter | application', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it looks up auth token on the session service', function (assert) {
    this.register('service:session', {
      authorize: function authorize(authorizer, block) {
        block('Authorization', 'Bearer 1234');
      }
    }, { instantiate: false });

    var adapter = this.subject();
    var setRequestHeader = _sinon.default.stub();
    adapter.ajaxOptions().beforeSend({ setRequestHeader: setRequestHeader });

    assert.ok(setRequestHeader.getCall(0).calledWithExactly('Authorization', 'Bearer 1234'));
  });

  (0, _emberQunit.test)('it uses the configuration for host and namespace', function (assert) {
    var adapter = this.subject();

    assert.equal((0, _get.default)(adapter, 'host'), 'localhost:9000');
    assert.equal((0, _get.default)(adapter, 'namespace'), 'v2');
  });
});
define('dummy/tests/unit/adapters/marketing-membership-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('adapter:marketing-membership', 'Unit | Adapter | marketing membership', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('urlForQuery', function (assert) {
    var adapter = this.subject();
    var url = adapter.urlForQuery({
      userId: '1234'
    });

    assert.equal(url, 'localhost:9000/v2/users/1234/orgMemberships');
  });

  (0, _emberQunit.test)('urlForCreateRecord', function (assert) {
    var adapter = this.subject();
    var url = adapter.urlForCreateRecord('marketing-membership');

    assert.equal(url, 'localhost:9000/v2/orgMemberships');
  });

  (0, _emberQunit.test)('urlForUpdateRecord', function (assert) {
    var adapter = this.subject();
    var url = adapter.urlForUpdateRecord('1', 'marketing-membership');

    assert.equal(url, 'localhost:9000/v2/orgMemberships/1');
  });
});
define('dummy/tests/unit/adapters/ticket-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('adapter:ticket', 'Unit | Adapter | ticket', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('directs queries with a order id to `orders/:id/tickets`', function (assert) {
    var adapter = this.subject({
      host: '',
      namespace: ''
    });

    assert.equal(adapter.urlForQuery({}, 'ticket'), '/tickets', 'tickets route used if no orderId');

    var query = { orderId: '1234' };
    assert.equal(adapter.urlForQuery(query, 'ticket'), '/orders/1234/tickets', 'users route used if user Id present');
    assert.ok(!('orderId' in query), '`orderId` was removed from query object');
  });
});
define('dummy/tests/unit/adapters/ticket-transfer-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('adapter:ticket-transfer', 'Unit | Adapter | ticket transfer', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('`urlForQueryRecord` will use `urlForFindRecord` if id is passed in the query', function (assert) {
    var adapter = this.subject();
    var query = { id: '1', other: 'test' };

    var url = adapter.urlForQueryRecord(query, 'ticket-transfer');
    assert.equal(url, 'localhost:9000/v2/ticket-transfers/1');
    assert.deepEqual(query, { other: 'test' }, 'the id was stripped from the query object');
  });

  (0, _emberQunit.test)('`urlForQueryRecord` works normally if no id is passed in the query', function (assert) {
    var adapter = this.subject();
    var query = { other: 'test' };

    var url = adapter.urlForQueryRecord(query, 'ticket-transfer');
    assert.equal(url, 'localhost:9000/v2/ticket-transfers');
    assert.deepEqual(query, { other: 'test' }, 'the query was untouched');
  });
});
define('dummy/tests/unit/adapters/user-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('adapter:user', 'Unit | Adapter | user', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it uses the `/users/me` on queryRecord', function (assert) {
    var adapter = this.subject();
    var query = { me: true };
    var url = adapter.urlForQueryRecord(query, 'user');
    assert.equal(url, 'localhost:9000/v2/users/me');
    assert.deepEqual(query, {}, 'me attribute stripped from query');
  });
});
define('dummy/tests/unit/controllers/accept/confirm-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'ember-metal/get', 'ember-metal/set'], function (_emberQunit, _testModuleForEngine, _get, _set) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('controller:accept/confirm', 'Unit | Controller | accept/confirm', {
    needs: ['service:i18n', 'service:flashMessages'],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it can toggle `agreedToPromotions`', function (assert) {
    var controller = this.subject({
      resolvedModel: {
        marketingPreference: {
          emailSubscription: false
        }
      }
    });

    controller.send('toggleAgreedToPromotions');

    assert.equal((0, _get.default)(controller, 'marketingPref.emailSubscription'), true);

    controller.send('toggleAgreedToPromotions');

    assert.equal((0, _get.default)(controller, 'marketingPref.emailSubscription'), false);
  });

  (0, _emberQunit.test)('the `acceptButtonDisabled` accomodates missing names', function (assert) {
    var controller = this.subject({
      acceptTransfer: {
        isRunning: false
      },
      resolvedModel: {
        user: {
          firstName: 'Spencer',
          lastName: '',
          email: 'spencer.price@ticketfly.com'
        }
      }
    });

    assert.ok((0, _get.default)(controller, 'acceptButtonDisabled'), 'disabled due to missing last name');

    (0, _set.default)(controller, 'user.lastName', 'Price');

    assert.ok(!(0, _get.default)(controller, 'acceptButtonDisabled'), 'no longer disabled');

    (0, _set.default)(controller, 'acceptTransfer.isRunning', true);

    assert.ok((0, _get.default)(controller, 'acceptButtonDisabled'), 'disabled due to flag');
  });

  (0, _emberQunit.test)('the `acceptButtonDisabled` accomodates attempt to accept into same account', function (assert) {
    var controller = this.subject({
      acceptTransfer: {
        isRunning: false
      },
      resolvedModel: {
        user: {
          firstName: 'Spencer',
          lastName: 'Price',
          email: 'spencer.price@ticketfly.com'
        },
        transfer: {
          sender: { email: 'spencer.price@ticketfly.com' }
        }
      }
    });

    assert.ok((0, _get.default)(controller, 'acceptButtonDisabled'), 'disabled due to same user as sender');

    (0, _set.default)(controller, 'user.email', 'spencer1234@ticketfly.com');

    assert.ok(!(0, _get.default)(controller, 'acceptButtonDisabled'), 'no longer disabled');
  });

  (0, _emberQunit.test)('`shouldDisplayUserNames` uses the original value of keys and ignores updates', function (assert) {
    var controller = this.subject({
      resolvedModel: {
        user: {
          firstName: 'Spencer',
          lastName: ''
        }
      }
    });

    assert.ok((0, _get.default)(controller, 'shouldDisplayUserNames'), 'initially is true');

    (0, _set.default)(controller, 'user.lastName', 'Price');

    assert.ok((0, _get.default)(controller, 'shouldDisplayUserNames'), 'remains true');
  });
});
define('dummy/tests/unit/controllers/new-test', ['ember-metal/get', 'ember-metal/set', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_get, _set, _emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('controller:new', 'Unit | Controller | new', {
    needs: ['service:transfers', 'service:flashMessages', 'service:i18n']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = {
      setTransferState: function setTransferState() {}
    };
    var serviceStub = _sinon.default.stub(service, 'setTransferState');

    this.register('service:transfers', service, { instantiate: false });

    var controller = this.subject();
    var transitionStub = _sinon.default.stub(controller, 'transitionToRoute');
    var method = _sinon.default.stub();

    transitionStub.returns({ method: method });

    controller.send('submitTransfer');

    assert.ok(transitionStub.getCall(0).calledWithExactly('new.modal.confirm'), 'the correct transition was initiated');
    assert.ok(method.getCall(0).calledWithExactly('replace'));
    assert.ok(serviceStub.getCall(0).calledWithExactly({
      tickets: (0, _get.default)(controller, 'selectedTickets'),
      email: (0, _get.default)(controller, 'transferToEmail'),
      message: (0, _get.default)(controller, 'transferMessage')
    }), '`setTransferState` was called on `transfers` service');
  });

  (0, _emberQunit.test)('it can reset the default state', function (assert) {
    var controller = this.subject();

    assert.equal((0, _get.default)(controller, 'transferToEmail'), '');
    assert.equal((0, _get.default)(controller, 'transferMessage'), '');
    assert.deepEqual((0, _get.default)(controller, 'selectedTickets'), []);

    (0, _set.default)(controller, 'transferToEmail', 'test@test.com');
    (0, _set.default)(controller, 'transferMessage', 'Hello!');
    (0, _get.default)(controller, 'selectedTickets').pushObject({});

    controller.resetState();

    assert.equal((0, _get.default)(controller, 'transferToEmail'), '');
    assert.equal((0, _get.default)(controller, 'transferMessage'), '');
    assert.deepEqual((0, _get.default)(controller, 'selectedTickets'), []);
  });
});
define('dummy/tests/unit/controllers/new/modal/cancel-test', ['ember-runloop', 'sinon', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberRunloop, _sinon, _emberQunit, _testModuleForEngine) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve,
      reject = RSVP.reject;


  function transferStub(result) {
    var reload = _sinon.default.stub().returns(resolve());
    var transfer = {
      cancel: function cancel() {},
      save: function save() {
        return resolve(result);
      },

      tickets: [{ reload: reload }]
    };

    _sinon.default.stub(transfer, 'cancel').returns(transfer);
    return {
      model: transfer,
      reloadStub: reload
    };
  }

  (0, _testModuleForEngine.moduleFor)('controller:new/modal/cancel', 'Unit | Controller | new/modal/cancel', {
    needs: [],
    beforeEach: function beforeEach() {
      var danger = this.danger = _sinon.default.stub();
      var success = this.success = _sinon.default.stub();

      this.register('service:flash-messages', { danger: danger, success: success }, { instantiate: false });
      this.register('service:i18n', {
        t: function t() {}
      }, { instantiate: false });
      this.register('service:metrics', {
        trackEvent: function trackEvent() {}
      }, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it can cancel a ticket transfer', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var _transferStub, model, reloadStub, controller;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _transferStub = transferStub({}), model = _transferStub.model, reloadStub = _transferStub.reloadStub;
              controller = this.subject({ model: model });
              _context.next = 4;
              return (0, _emberRunloop.default)(controller.get('cancelTransfer'), 'perform');

            case 4:

              assert.equal(model.cancel.callCount, 1, 'the model\'s cancel hook was called');
              assert.equal(this.success.callCount, 1, 'the success message was sent');
              assert.equal(this.danger.callCount, 0, 'the danger message was not sent');
              assert.equal(reloadStub.callCount, 1, 'the ticket was reloaded');

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('it handles a cancellation error', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var _transferStub2, model, reloadStub, controller;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _transferStub2 = transferStub(reject({})), model = _transferStub2.model, reloadStub = _transferStub2.reloadStub;
              controller = this.subject({ model: model });
              _context2.next = 4;
              return (0, _emberRunloop.default)(controller.get('cancelTransfer'), 'perform');

            case 4:

              assert.equal(model.cancel.callCount, 1, 'the model\'s cancel hook was called');
              assert.equal(this.success.callCount, 0, 'the success message was not sent');
              assert.equal(this.danger.callCount, 1, 'the danger message was sent');
              assert.equal(reloadStub.callCount, 0, 'the ticket was not reloaded on an error');

            case 8:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('the `cancelTransfer` action will transition to "new" on successful cancel', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(assert) {
      var promise, perform, cancelTransfer, controller, transitionStub, method;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              promise = resolve();
              perform = _sinon.default.stub().returns(promise);
              cancelTransfer = { perform: perform };
              controller = this.subject({ cancelTransfer: cancelTransfer });
              transitionStub = _sinon.default.stub(controller, 'transitionToRoute');
              method = _sinon.default.stub();


              transitionStub.returns({ method: method });

              controller.send('cancelTransfer');

              _context3.next = 10;
              return promise.then(function () {
                assert.equal(transitionStub.getCall(0).args[0], 'new');
                assert.ok(method.getCall(0).calledWithExactly('replace'));
              });

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
});
define('dummy/tests/unit/controllers/new/modal/confirm-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon', 'ember-runloop'], function (_emberQunit, _testModuleForEngine, _sinon, _emberRunloop) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve,
      reject = RSVP.reject;


  function saveable(result) {
    var saveablePromise = resolve(result);
    saveablePromise.save = function () {
      return saveablePromise;
    };
    return saveablePromise;
  }

  (0, _testModuleForEngine.moduleFor)('controller:new/modal/confirm', 'Unit | Controller | new/modal/confirm', {
    needs: [],
    beforeEach: function beforeEach() {
      // Create a stub for the store's createRecord hook
      var createRecord = this.createStub = _sinon.default.stub();
      createRecord.returns(saveable({}));

      var danger = this.danger = _sinon.default.stub();
      this.register('service:flash-messages', { danger: danger }, { instantiate: false });
      this.register('service:store', { createRecord: createRecord }, { instantiate: false });
      this.register('service:i18n', {
        t: function t() {}
      }, { instantiate: false });
      this.register('service:metrics', {
        trackEvent: function trackEvent() {}
      }, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it can create a transfer', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var controller, transitionStub, method;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              controller = this.subject();
              transitionStub = _sinon.default.stub(controller, 'transitionToRoute');
              method = _sinon.default.stub();


              transitionStub.returns({ method: method });
              _sinon.default.stub(controller, 'send');

              controller.set('model', {
                tickets: [{ id: '1' }, { id: '2' }],
                email: 'foo@bar.baz',
                message: 'test'
              });

              _context.next = 8;
              return (0, _emberRunloop.default)(controller.get('createTransfer'), 'perform');

            case 8:

              assert.deepEqual(this.createStub.getCall(0).args[1], {
                tickets: [{ id: '1' }, { id: '2' }],
                message: 'test',
                recipient: {
                  email: 'foo@bar.baz'
                }
              });

            case 9:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('it redirects to `/success` on successful transfer', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var controller, transitionStub, method, loading;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              controller = this.subject();
              transitionStub = _sinon.default.stub(controller, 'transitionToRoute');
              method = _sinon.default.stub();
              loading = _sinon.default.stub(controller, 'send');


              transitionStub.returns({ method: method });

              controller.set('model', {
                tickets: [], recipient: {}
              });

              _context2.next = 8;
              return (0, _emberRunloop.default)(controller.get('createTransfer'), 'perform');

            case 8:

              assert.equal(loading.getCall(0).args[0], 'showLoading', 'the `showLoading` hook was triggered');
              assert.equal(transitionStub.getCall(0).args[0], 'new.modal.success', 'transitioned to success route');
              assert.ok(method.getCall(0).calledWith('replace'));

            case 11:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('it redirects to `/error` on failed transfer', function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(assert) {
      var controller, transitionStub, method, loading;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              controller = this.subject();
              transitionStub = _sinon.default.stub(controller, 'transitionToRoute');
              method = _sinon.default.stub();
              loading = _sinon.default.stub(controller, 'send');


              transitionStub.returns({ method: method });

              // Create a rejecting promise.
              this.createStub.returns(saveable(reject({})));

              controller.set('model', {
                tickets: [], recipient: {}
              });

              _context3.next = 9;
              return (0, _emberRunloop.default)(controller.get('createTransfer'), 'perform');

            case 9:

              assert.equal(loading.getCall(0).args[0], 'showLoading', 'the `showLoading` hook was triggered');
              assert.equal(transitionStub.getCall(0).args[0], 'new.modal.confirm', 'transitioned back to confirm route');
              assert.equal(this.danger.callCount, 1, 'triggered a flashMessage');
              assert.ok(method.getCall(0).calledWith('replace'));

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }());
});
define('dummy/tests/unit/helpers/array-copy-test', ['ticket-transfer-addon/helpers/array-copy', 'qunit'], function (_arrayCopy, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Helper | array copy');

  (0, _qunit.test)('it works with arrays', function (assert) {
    var array = [{}, {}];
    var result = (0, _arrayCopy.arrayCopy)([array]);
    assert.notEqual(array, result, 'not the same instance');
    assert.deepEqual(array, result, 'but is the same contents');
  });

  (0, _qunit.test)('it works with falsey values', function (assert) {
    var result = (0, _arrayCopy.arrayCopy)([null]);
    assert.deepEqual(result, [], 'falsey are converted into empty arrays');
  });

  (0, _qunit.test)('it works with non-array values', function (assert) {
    var result = (0, _arrayCopy.arrayCopy)([12]);
    assert.deepEqual(result, [12]);
  });
});
define('dummy/tests/unit/helpers/barcode-obfuscator-test', ['ticket-transfer-addon/helpers/barcode-obfuscator', 'qunit'], function (_barcodeObfuscator, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Helper | barcode obfuscator');

  (0, _qunit.test)('it works', function (assert) {
    var result = (0, _barcodeObfuscator.barcodeObfuscator)(['123456789']);

    assert.equal(result, '*****6789');
  });

  (0, _qunit.test)('it converts to a string if other type', function (assert) {
    var result = (0, _barcodeObfuscator.barcodeObfuscator)([12345]);

    assert.equal(result, '*2345');
  });

  (0, _qunit.test)('it returns an empty string if original is empty string', function (assert) {
    var result = (0, _barcodeObfuscator.barcodeObfuscator)(['']);

    assert.equal(result, '');
  });

  (0, _qunit.test)('it returns an empty string if original is null', function (assert) {
    var result = (0, _barcodeObfuscator.barcodeObfuscator)([]);

    assert.equal(result, '');
  });
});
define('dummy/tests/unit/helpers/line-breaker-test', ['ticket-transfer-addon/helpers/line-breaker', 'qunit'], function (_lineBreaker, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Helper | line breaker');

  (0, _qunit.test)('it creates a span node to contain all the parts', function (assert) {
    var node = (0, _lineBreaker.lineBreaker)(['test']);

    assert.equal(node.nodeName, 'SPAN');
  });

  (0, _qunit.test)('it creates a text node if only one line of text', function (assert) {
    var node = (0, _lineBreaker.lineBreaker)(['test']);

    assert.equal(node.childNodes.length, 1);
    assert.equal(node.childNodes[0].nodeName, '#text');
  });

  (0, _qunit.test)('it creates a <br> for each line break', function (assert) {
    var node = (0, _lineBreaker.lineBreaker)(['test\nthing']);

    assert.equal(node.childNodes.length, 3);

    assert.equal(node.childNodes[0].textContent, 'test');
    assert.equal(node.childNodes[2].textContent, 'thing');
    assert.equal(node.childNodes[1].nodeName, 'BR');
  });

  (0, _qunit.test)('it supports double line breaks', function (assert) {
    var node = (0, _lineBreaker.lineBreaker)(['test\n\nthing']);

    assert.equal(node.childNodes.length, 4);

    assert.equal(node.childNodes[0].textContent, 'test');
    assert.equal(node.childNodes[1].nodeName, 'BR');
    assert.equal(node.childNodes[2].nodeName, 'BR');
    assert.equal(node.childNodes[3].textContent, 'thing');
  });

  (0, _qunit.test)('it does not allow for arbitrary html', function (assert) {
    var node = (0, _lineBreaker.lineBreaker)(['<b>Hello!</b>\nthing']);

    assert.equal(node.childNodes.length, 3);

    assert.equal(node.childNodes[0].textContent, '<b>Hello!</b>');
    assert.equal(node.childNodes[2].textContent, 'thing');
    assert.equal(node.childNodes[1].nodeName, 'BR');
  });
});
define('dummy/tests/unit/helpers/tta-inc-test', ['ticket-transfer-addon/helpers/tta-inc', 'qunit'], function (_ttaInc, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Helper | tta inc');

  (0, _qunit.test)('it increments by 1 by default', function (assert) {
    assert.expect(1);

    var result = (0, _ttaInc.ttaInc)([42]);

    assert.equal(result, 43, 'number is correct');
  });

  (0, _qunit.test)('it increments by the second param if provided', function (assert) {
    assert.expect(1);

    var result = (0, _ttaInc.ttaInc)([42, 2]);

    assert.equal(result, 44, 'number is correct');
  });
});
define('dummy/tests/unit/helpers/tta-section-details-test', ['ember-string', 'ticket-transfer-addon/helpers/tta-section-details', 'qunit'], function (_emberString, _ttaSectionDetails, _qunit) {
  'use strict';

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  (0, _qunit.module)('Unit | Helper | tta section details', {
    beforeEach: function beforeEach() {
      this.i18n = {
        t: function t(path) {
          var _path$split = path.split('.'),
              _path$split2 = _slicedToArray(_path$split, 2),
              key = _path$split2[1];

          return (0, _emberString.capitalize)(key);
        }
      };
    }
  });

  (0, _qunit.test)('it accepts a properties object', function (assert) {
    var result = (0, _ttaSectionDetails.ttaSectionDetails)([{
      section: 'foo',
      row: 'bar',
      seat: 'baz',
      variantName: 'Reserved'
    }], {}, this.i18n);

    assert.equal(result.toString(), 'Section foo &#183; Row bar &#183; Seat baz');
  });

  (0, _qunit.test)('it accepts individual properties', function (assert) {
    var result = (0, _ttaSectionDetails.ttaSectionDetails)([], {
      section: 'foo',
      row: 'bar',
      seat: 'baz'
    }, this.i18n);

    assert.equal(result.toString(), 'Section foo &#183; Row bar &#183; Seat baz');
  });

  (0, _qunit.test)('it accepts a properties object with individual overrides', function (assert) {
    var result = (0, _ttaSectionDetails.ttaSectionDetails)([{
      section: 'foo',
      row: 'bar',
      seat: 'baz',
      variantName: 'Reserved'
    }], {
      row: 'bar2'
    }, this.i18n);

    assert.equal(result.toString(), 'Section foo &#183; Row bar2 &#183; Seat baz');
  });

  (0, _qunit.test)('it accepts a not-complete properties object', function (assert) {
    var result = (0, _ttaSectionDetails.ttaSectionDetails)([{
      section: 'foo'
    }], {}, this.i18n);

    assert.equal(result, 'Section foo');
  });

  (0, _qunit.test)('it results in empty string if no details provided', function (assert) {
    var result = (0, _ttaSectionDetails.ttaSectionDetails)([{}], {}, this.i18n);

    assert.equal(result, '');
  });
});
define('dummy/tests/unit/helpers/tta-transfer-state-test', ['sinon', 'ticket-transfer-addon/helpers/tta-transfer-state', 'qunit'], function (_sinon, _ttaTransferState, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Helper | tta transfer state', {
    beforeEach: function beforeEach() {
      var t = this.translate = _sinon.default.stub();
      this.i18n = { t: t };
    }
  });

  // Replace this with your real tests.
  (0, _qunit.test)('it renders nothing if ticket is transferable', function (assert) {
    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: true,
      description: 'READY_TO_TRANSFER'
    }], {}, this.i18n);

    assert.equal(result, '');
  });

  (0, _qunit.test)('it renders description if ticket is not transferable', function (assert) {
    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false,
      description: 'Non-transferable / Outdated'
    }], {}, this.i18n);

    assert.equal(result, 'Non-transferable / Outdated');
  });

  (0, _qunit.test)('it shows state if not transferable with no transfer', function (assert) {
    this.translate.returns('Transfer Disabled');

    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false
    }], {}, this.i18n);

    assert.equal(result, 'Transfer Disabled');
  });

  (0, _qunit.test)('it shows state if not transferable with successful transfer', function (assert) {
    this.translate.withArgs('transfer_request.transferred_to', { email: 'alexander@hamilton.com' }).returns('Transferred to alexander@hamilton.com');

    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false
    }, {
      isPending: false,
      recipient: {
        email: 'alexander@hamilton.com'
      }
    }], {}, this.i18n);

    assert.equal(result, 'Transferred to alexander@hamilton.com');
  });

  (0, _qunit.test)('it shows state transfer not yet accepted', function (assert) {
    this.translate.withArgs('transfer_request.awaiting_acceptance_from', { email: 'alexander@hamilton.com' }).returns('Awaiting acceptance from alexander@hamilton.com');

    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false
    }, {
      isPending: true,
      recipient: {
        email: 'alexander@hamilton.com'
      }
    }], {}, this.i18n);

    assert.equal(result, 'Awaiting acceptance from alexander@hamilton.com');
  });

  (0, _qunit.test)('it shows state transfer not yet accepted even with transfer state description', function (assert) {
    this.translate.withArgs('transfer_request.awaiting_acceptance_from', { email: 'alexander@hamilton.com' }).returns('Awaiting acceptance from alexander@hamilton.com');

    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false,
      description: 'Pending transfer'
    }, {
      isPending: true,
      recipient: {
        email: 'alexander@hamilton.com'
      }
    }], {}, this.i18n);

    assert.equal(result, 'Awaiting acceptance from alexander@hamilton.com');
  });

  (0, _qunit.test)('it will show state description if not transferable, but has cancelled transfer', function (assert) {
    var result = (0, _ttaTransferState.ttaTransferState)([{
      transferable: false,
      description: 'Non-resellable / Scanned'
    }, { isCancelled: true }], {}, this.i18n);

    assert.equal(result, 'Non-resellable / Scanned');
  });
});
define('dummy/tests/unit/mixins/new-transfer-state-model-test', ['ember-object', 'ticket-transfer-addon/mixins/new-transfer-state-model', 'qunit'], function (_emberObject, _newTransferStateModel, _qunit) {
  'use strict';

  (0, _qunit.module)('Unit | Mixin | new transfer state model');

  (0, _qunit.test)('it exists', function (assert) {
    // This mixin is implicitly tested in acceptances tests and the `routes/new/confirm-test`
    var NewTransferStateModelObject = _emberObject.default.extend(_newTransferStateModel.default);
    var subject = NewTransferStateModelObject.create();
    assert.ok(subject);
  });
});
define('dummy/tests/unit/models/event-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('event', 'Unit | Model | event', {});

  (0, _emberQunit.test)('it should exist', function (assert) {
    var Event = this.store().modelFor('event');
    assert.ok(Event);
  });
});
define('dummy/tests/unit/models/marketing-membership-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('marketing-membership', 'Unit | Model |  marketing membership', {});

  (0, _emberQunit.test)('it exists', function (assert) {
    var MarketingMembership = this.store().modelFor('marketing-membership');
    assert.ok(MarketingMembership);
  });
});
define('dummy/tests/unit/models/ticket-test', ['ember-metal/get', 'ember-qunit'], function (_get, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('ticket', 'Unit | Model | ticket', {
    needs: ['model:event', 'model:ticket-transfer']
  });

  (0, _emberQunit.test)('transferState is passed as an unmodified POJO', function (assert) {
    var transferState = {};
    var model = this.subject({ transferState: transferState });

    assert.equal(model.get('transferState'), transferState);
  });

  (0, _emberQunit.test)('should belong to an event', function (assert) {
    var Ticket = this.store().modelFor('ticket');
    var relationship = (0, _get.default)(Ticket, 'relationshipsByName').get('event');

    assert.equal(relationship.key, 'event');
    assert.equal(relationship.kind, 'belongsTo');
  });

  (0, _emberQunit.test)('should belong to a ticket-transfer', function (assert) {
    var Ticket = this.store().modelFor('ticket');
    var relationship = (0, _get.default)(Ticket, 'relationshipsByName').get('transfer');

    assert.equal(relationship.key, 'transfer');
    assert.equal(relationship.kind, 'belongsTo');
  });
});
define('dummy/tests/unit/models/ticket-transfer-test', ['ember-metal/get', 'ember-metal/set', 'ember-runloop', 'ember-qunit'], function (_get, _set, _emberRunloop, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('ticket-transfer', 'Unit | Model | ticket transfer', {
    needs: ['model:ticket', 'model:event']
  });

  (0, _emberQunit.test)('mode defaults to RECIPIENT_ACCEPT', function (assert) {
    var model = this.subject();
    assert.equal((0, _get.default)(model, 'mode'), 'RECIPIENT_ACCEPT');
  });

  (0, _emberQunit.test)('status defaults to PENDING', function (assert) {
    var model = this.subject();
    assert.equal((0, _get.default)(model, 'status'), 'PENDING');
  });

  (0, _emberQunit.test)('should have many tickets', function (assert) {
    var TicketTransfer = this.store().modelFor('ticket-transfer');
    var relationship = (0, _get.default)(TicketTransfer, 'relationshipsByName').get('tickets');

    assert.equal(relationship.key, 'tickets');
    assert.equal(relationship.kind, 'hasMany');
  });

  (0, _emberQunit.test)('the `accept` hook sets the correct status', function (assert) {
    var ticket = (0, _emberRunloop.default)(this.store(), 'createRecord', 'ticket');
    var model = this.subject({
      tickets: [ticket]
    });

    assert.equal((0, _get.default)(model, 'status'), 'PENDING');

    var chain = void 0;

    (0, _emberRunloop.default)(function () {
      chain = model.accept('1234-4567');
    });

    assert.equal((0, _get.default)(model, 'status'), 'COMPLETED');
    assert.equal((0, _get.default)(model, 'acceptanceToken'), '1234-4567');
    assert.equal(chain, model, 'the hook is chainable');
  });

  (0, _emberQunit.test)('the `accept` hook sets the correct status if empty tickets', function (assert) {
    var model = this.subject({
      tickets: []
    });

    assert.equal((0, _get.default)(model, 'status'), 'PENDING');

    var chain = void 0;

    (0, _emberRunloop.default)(function () {
      chain = model.accept();
    });

    assert.equal((0, _get.default)(model, 'status'), 'DENIED');
    assert.equal(chain, model, 'the hook is chainable');
  });

  (0, _emberQunit.test)('the `accept` hook sets the correct status if empty tickets', function (assert) {
    var model = this.subject({
      tickets: []
    });

    assert.equal((0, _get.default)(model, 'status'), 'PENDING');

    var chain = void 0;

    (0, _emberRunloop.default)(function () {
      chain = model.accept();
    });

    assert.equal((0, _get.default)(model, 'status'), 'DENIED');
    assert.equal(chain, model, 'the hook is chainable');
  });

  (0, _emberQunit.test)('the `cancel` hook sets the correct status', function (assert) {
    var model = this.subject();

    assert.equal((0, _get.default)(model, 'status'), 'PENDING');

    var chain = void 0;

    (0, _emberRunloop.default)(function () {
      chain = model.cancel();
    });

    assert.equal((0, _get.default)(model, 'status'), 'CANCELLED');
    assert.equal(chain, model, 'the hook is chainable');
  });

  (0, _emberQunit.test)('the `isCancelable` property works', function (assert) {
    var model = this.subject();

    assert.ok(model.get('isCancelable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'COMPLETED');

    assert.ok(!model.get('isCancelable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'DENIED');

    assert.ok(!model.get('isCancelable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'CANCELLED');

    assert.ok(!model.get('isCancelable'));
  });

  (0, _emberQunit.test)('the `isPending` property works', function (assert) {
    var model = this.subject();

    assert.ok(model.get('isPending'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'COMPLETED');

    assert.ok(!model.get('isPending'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'DENIED');

    assert.ok(!model.get('isPending'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'CANCELLED');

    assert.ok(!model.get('isPending'));
  });

  (0, _emberQunit.test)('the `isCancelled` property works', function (assert) {
    var model = this.subject();

    assert.ok(!model.get('isCancelled'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'COMPLETED');

    assert.ok(!model.get('isCancelled'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'DENIED');

    assert.ok(!model.get('isCancelled'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'CANCELLED');

    assert.ok(model.get('isCancelled'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', '');

    assert.ok(model.get('isCancelled'));
  });

  (0, _emberQunit.test)('the `isAcceptable` property works', function (assert) {
    var model = this.subject();

    assert.ok(model.get('isAcceptable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'COMPLETED');

    assert.ok(!model.get('isAcceptable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'DENIED');

    assert.ok(!model.get('isAcceptable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'CANCELLED');

    assert.ok(!model.get('isAcceptable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'PENDING');

    assert.ok(model.get('isAcceptable'));

    (0, _emberRunloop.default)(null, _set.default, model, 'acceptanceState', {
      acceptable: false
    });

    assert.ok(!model.get('isAcceptable'));
  });

  (0, _emberQunit.test)('the `isTransferred` property works', function (assert) {
    var model = this.subject();

    assert.ok(!model.get('isTransferred'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'COMPLETED');

    assert.ok(model.get('isTransferred'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'DENIED');

    assert.ok(!model.get('isTransferred'));

    (0, _emberRunloop.default)(null, _set.default, model, 'status', 'CANCELLED');

    assert.ok(!model.get('isTransferred'));
  });
});
define('dummy/tests/unit/models/user-test', ['ember-qunit', 'ember-metal/get', 'sinon'], function (_emberQunit, _get, _sinon) {
  'use strict';

  (0, _emberQunit.moduleForModel)('user', 'Unit | Model | user', {
    needs: ['service:metrics']
  });

  (0, _emberQunit.test)('it exists and has an ID', function (assert) {
    var model = this.subject({ id: 1234 });
    assert.equal(model.get('id'), '1234');
  });

  (0, _emberQunit.test)('it will identify a user with metrics service', function (assert) {
    var model = this.subject({
      id: '1234',
      firstName: 'Spencer',
      lastName: 'Price'
    });

    var metrics = (0, _get.default)(model, 'metrics');
    var aliasStub = _sinon.default.stub(metrics, 'alias');
    var identifyStub = _sinon.default.stub(metrics, 'identify');

    model.identifyUserForMetrics();

    assert.equal(aliasStub.callCount, 1);
    assert.ok(aliasStub.getCall(0).calledWithExactly({
      alias: '1234'
    }));

    assert.equal(identifyStub.callCount, 1);
    assert.ok(identifyStub.getCall(0).calledWithExactly({
      distinctId: '1234',
      firstName: 'Spencer',
      lastName: 'Price'
    }));
  });
});
define('dummy/tests/unit/routes/accept-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:accept', 'Unit | Route | accept', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:session', {}, { instantiate: false });
    }
  });

  // TODO: Test the model hook.
  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/accept/confirm-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon', 'ember-runloop', 'ember-array/utils'], function (_emberQunit, _testModuleForEngine, _sinon, _emberRunloop, _utils) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve;


  (0, _testModuleForEngine.moduleFor)('route:accept/confirm', 'Unit | Route | accept/confirm', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  (0, _emberQunit.test)('if defaultMemberships array exists and orgId is correct, it returns correct defaultEmailSub value', function (assert) {
    var route = this.subject();

    var meta = {
      defaultMemberships: [{
        defaultEmailSub: false,
        orgId: 1
      }]
    };

    var emailSub = route.defaultValueForOrg({ meta: meta }, 1);

    assert.equal(emailSub, false, 'it returns false');
  });

  (0, _emberQunit.test)('if defaultMemberships array exists and orgId is a string, it returns correct defaultEmailSub value', function (assert) {
    var route = this.subject();

    var meta = {
      defaultMemberships: [{
        defaultEmailSub: false,
        orgId: 1
      }]
    };

    var emailSub = route.defaultValueForOrg({ meta: meta }, "1");

    assert.equal(emailSub, false, 'it returns false');
  });

  (0, _emberQunit.test)('if the orgId is incorrect, it returns the default value true', function (assert) {
    var route = this.subject();

    var meta = {
      defaultMemberships: [{
        defaultEmailSub: true,
        orgId: 1
      }]
    };

    var orgDefaultValue = route.defaultValueForOrg({ meta: meta }, 4);

    assert.equal(orgDefaultValue, true, 'it returns true');
  });

  (0, _emberQunit.test)('if the no meta object is present, it returns the detault value true', function (assert) {
    var route = this.subject();
    var orgDefaultValue = route.defaultValueForOrg({}, 4);

    assert.equal(orgDefaultValue, true, 'it returns true');
  });

  (0, _emberQunit.test)('if membership exists, return membership', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var route, eventPromise, userPromise, store, queryStub, membershipStub, membership;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              route = this.subject();
              eventPromise = resolve({ organizationId: 1 });
              userPromise = resolve({ id: 2 });
              store = route.get('store');
              queryStub = _sinon.default.stub(store, 'query');
              membershipStub = {};

              queryStub.returns(resolve((0, _utils.A)([membershipStub])));

              _context.next = 9;
              return (0, _emberRunloop.default)(function () {
                return route.get('getMarketingPreference').perform(eventPromise, userPromise);
              });

            case 9:
              membership = _context.sent;


              assert.equal(membership, membershipStub, 'resolves with membership');
              assert.ok(queryStub.getCall(0).calledWithExactly('marketing-membership', { userId: 2, orgId: 1 }));

            case 12:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('if membership does not exist, run defaultValueForOrg method', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var route, eventPromise, userPromise, store, queryStub, createStub, initialMembership, defaultValueForOrgStub, membership;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              route = this.subject();
              eventPromise = resolve({ organizationId: 1 });
              userPromise = resolve({ id: 2 });
              store = route.get('store');
              queryStub = _sinon.default.stub(store, 'query');
              createStub = _sinon.default.stub(store, 'createRecord');


              queryStub.returns(resolve((0, _utils.A)([])));

              initialMembership = {};
              defaultValueForOrgStub = _sinon.default.stub(route, 'defaultValueForOrg');


              createStub.returns(initialMembership);
              defaultValueForOrgStub.returns(true);

              _context2.next = 13;
              return (0, _emberRunloop.default)(function () {
                return route.get('getMarketingPreference').perform(eventPromise, userPromise);
              });

            case 13:
              membership = _context2.sent;


              assert.equal(membership, initialMembership, 'resolves with membership');
              assert.ok(createStub.getCall(0).calledWithExactly('marketing-membership', {
                userId: 2,
                orgId: 1,
                emailSubscription: true
              }));

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define('dummy/tests/unit/routes/accept/confirm/terms-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:accept/confirm/terms', 'Unit | Route | accept/confirm/terms', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/accept/index-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve;


  (0, _testModuleForEngine.moduleFor)('route:accept/index', 'Unit | Route | accept/index', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it redirects to `confirm` if the transfer is accpetable', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var replaceWith, route, transfer;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              replaceWith = _sinon.default.stub();
              route = this.subject({ replaceWith: replaceWith });
              transfer = resolve({ isAcceptable: true });
              _context.next = 5;
              return route.afterModel({ transfer: transfer });

            case 5:

              assert.ok(replaceWith.getCall(0).calledWithExactly('accept.confirm'));

            case 6:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  (0, _emberQunit.test)('it does not redirect to `confirm` if the transfer is not accpetable', function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(assert) {
      var replaceWith, route, transfer;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              replaceWith = _sinon.default.stub();
              route = this.subject({ replaceWith: replaceWith });
              transfer = resolve({ isAcceptable: false });
              _context2.next = 5;
              return route.afterModel({ transfer: transfer });

            case 5:

              assert.equal(replaceWith.callCount, 0, 'no redirect');

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
});
define('dummy/tests/unit/routes/accept/success-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:accept/success', 'Unit | Route | accept/success', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/application-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:application', 'Unit | Route | application', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/new-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  function _asyncToGenerator(fn) {
    return function () {
      var gen = fn.apply(this, arguments);
      return new Promise(function (resolve, reject) {
        function step(key, arg) {
          try {
            var info = gen[key](arg);
            var value = info.value;
          } catch (error) {
            reject(error);
            return;
          }

          if (info.done) {
            resolve(value);
          } else {
            return Promise.resolve(value).then(function (value) {
              step("next", value);
            }, function (err) {
              step("throw", err);
            });
          }
        }

        return step("next");
      });
    };
  }

  var RSVP = Ember.RSVP;
  var resolve = RSVP.resolve,
      hash = RSVP.hash;


  (0, _testModuleForEngine.moduleFor)('route:new', 'Unit | Route | new', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
      this.register('service:session', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('required ticket query parameters are all present', function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(assert) {
      var query, queryRecord, route;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              query = _sinon.default.stub();
              queryRecord = _sinon.default.stub().returns(resolve({ id: '2' }));


              this.register('service:store', {
                queryRecord: queryRecord,
                query: query,
                find: function find() {}
              }, { instantiate: false });

              route = this.subject();
              _context.next = 6;
              return hash(route.model({ orderId: '1234', eventId: '9876' }));

            case 6:

              assert.equal(query.getCall(0).args[1].transferredTickets, true, 'the transferred tickets was added to the query');
              assert.equal(query.getCall(0).args[1].orderId, 1234, 'the sale code was added to the query');
              assert.equal(query.getCall(0).args[1].include, 'transfers', 'the include was added to the query');
              assert.equal(query.getCall(0).args[1].eventId, 9876, 'the event id was added to the query');

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
});
define('dummy/tests/unit/routes/new/modal-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal', 'Unit | Route | new/modal', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/new/modal/cancel-test', ['ember-object', 'ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_emberObject, _emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal/cancel', 'Unit | Route | new/modal/cancel', {
    needs: ['service:i18n', 'service:flash-messages', 'model:ticket-transfer'],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('the route fetches the model from the local store cache', function (assert) {
    var peekRecord = _sinon.default.stub();
    var store = { peekRecord: peekRecord };

    var route = this.subject({ store: store });

    var model = {};
    peekRecord.returns(model);

    var result = route.model({ transferId: '1234' });

    assert.equal(result, model);
    assert.ok(peekRecord.getCall(0).calledWithExactly('ticket-transfer', '1234'));
  });

  (0, _emberQunit.test)('the route will send an error and transition away if there is no local store cache for the transfer', function (assert) {
    var danger = _sinon.default.stub();
    var replaceWith = _sinon.default.stub();
    var flashMessages = { danger: danger };
    var i18n = {
      t: function t() {}
    };

    var route = this.subject({ flashMessages: flashMessages, replaceWith: replaceWith, i18n: i18n });

    var model = route.model({ transferId: '1234' });

    route.setupController(_emberObject.default.create(), model);

    assert.ok(replaceWith.getCall(0).calledWithExactly('new'));
    assert.equal(danger.callCount, 1, 'a flash message was sent');
  });
});
define('dummy/tests/unit/routes/new/modal/confirm-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine', 'sinon'], function (_emberQunit, _testModuleForEngine, _sinon) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal/confirm', 'Unit | Route | new/modal/confirm', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it gets the model from the `transfers` service', function (assert) {
    var service = {
      getTransferState: function getTransferState() {}
    };
    var serviceStub = _sinon.default.stub(service, 'getTransferState');

    serviceStub.returns({
      tickets: [{}],
      email: 'foo@bar.baz'
    });

    this.register('service:transfers', service, { instantiate: false });

    var route = this.subject();

    assert.deepEqual(route.model(), {
      tickets: [{}],
      email: 'foo@bar.baz'
    });

    assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
  });

  (0, _emberQunit.test)('it redirects with empty tickets array', function (assert) {
    var service = {
      getTransferState: function getTransferState() {}
    };
    var serviceStub = _sinon.default.stub(service, 'getTransferState');

    serviceStub.returns({
      tickets: [],
      email: 'foo@bar.baz'
    });

    this.register('service:transfers', service, { instantiate: false });

    var route = this.subject();
    var transitionStub = _sinon.default.stub(route, 'replaceWith');

    assert.ok(!route.model(), 'model returns falsey value');
    assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
    assert.ok(transitionStub.getCall(0).calledWithExactly('new.index'), 'transition back to order transfer page');
  });

  (0, _emberQunit.test)('it redirects with empty email', function (assert) {
    var service = {
      getTransferState: function getTransferState() {}
    };
    var serviceStub = _sinon.default.stub(service, 'getTransferState');

    serviceStub.returns({
      tickets: [{}],
      email: ''
    });

    this.register('service:transfers', service, { instantiate: false });

    var route = this.subject();
    var transitionStub = _sinon.default.stub(route, 'replaceWith');

    assert.ok(!route.model(), 'model returns falsey value');
    assert.equal(serviceStub.callCount, 1, '`getTransferState` was called once');
    assert.ok(transitionStub.getCall(0).calledWithExactly('new.index'), 'transition back to order transfer page');
  });
});
define('dummy/tests/unit/routes/new/modal/index-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal/index', 'Unit | Route | new/modal/index', {
    needs: [],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/new/modal/success-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal/success', 'Unit | Route | new/modal/success', {
    needs: ['service:transfers'],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/routes/new/modal/terms-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('route:new/modal/terms', 'Unit | Route | new/modal/terms', {
    needs: ['service:transfers'],
    beforeEach: function beforeEach() {
      this.register('service:metrics', {}, { instantiate: false });
    }
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('dummy/tests/unit/serializers/application-test', ['ember-data/model', 'ember-runloop', 'ember-data/relationships', 'ember-qunit'], function (_model, _emberRunloop, _relationships, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('ticket', 'Unit | Serializer | application', {
    needs: ['serializer:application']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it uses ${key}Id for belongsTo relationships', function (assert) {
    this.container.registry.register('model:test-b', _model.default.extend());
    this.container.registry.register('model:test-a', _model.default.extend({
      child: (0, _relationships.belongsTo)('test-b')
    }));

    var store = this.store();
    (0, _emberRunloop.default)(store, 'pushPayload', {
      testA: {
        id: '1',
        childId: '2'
      },
      testB: {
        id: '2'
      }
    });

    assert.equal(store.peekRecord('test-a', '1').get('child.id'), '2');
  });

  (0, _emberQunit.test)('it uses ${key}Ids for hasMany relationships', function (assert) {
    this.container.registry.register('model:test-b', _model.default.extend());
    this.container.registry.register('model:test-a', _model.default.extend({
      children: (0, _relationships.hasMany)('test-b')
    }));

    var store = this.store();
    (0, _emberRunloop.default)(store, 'pushPayload', {
      testA: {
        id: '1',
        childIds: ['2', '3']
      },
      testBs: [{ id: '2' }, { id: '3' }]
    });

    assert.deepEqual(store.peekRecord('test-a', '1').get('children').mapBy('id'), ['2', '3']);
  });
});
define('dummy/tests/unit/serializers/event-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('event', 'Unit | Serializer | event', {
    needs: ['serializer:event', 'serializer:application']
  });

  (0, _emberQunit.test)('it joins the venue information into an event with single response', function (assert) {
    var store = this.store();
    var serializer = store.serializerFor('event');

    var result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
      event: { id: '1', venueId: '2' },
      venues: [{ id: '2' }]
    }, '1', 'findRecord');

    assert.deepEqual(result, {
      data: {
        type: 'event',
        id: '1',
        attributes: {
          venue: { id: '2' }
        },
        relationships: {}
      },
      included: []
    });
  });

  (0, _emberQunit.test)('it assigns `null` to venue if no corresponding venue was found', function (assert) {
    var store = this.store();
    var serializer = store.serializerFor('event');

    var result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
      event: { id: '1', venueId: '2' },
      venues: [{ id: '3' }]
    }, '1', 'findRecord');

    assert.deepEqual(result, {
      data: {
        type: 'event',
        id: '1',
        attributes: {
          venue: null
        },
        relationships: {}
      },
      included: []
    });
  });

  (0, _emberQunit.test)('it assigns `null` to venue if it has not venue', function (assert) {
    var store = this.store();
    var serializer = store.serializerFor('event');

    var result = serializer.normalizeSingleResponse(store, store.modelFor('event'), {
      event: { id: '1' },
      venues: [{ id: '3' }]
    }, '1', 'findRecord');

    assert.deepEqual(result, {
      data: {
        type: 'event',
        id: '1',
        attributes: {
          venue: null
        },
        relationships: {}
      },
      included: []
    });
  });

  (0, _emberQunit.test)('it joins the venue information into an event with array response', function (assert) {
    var store = this.store();
    var serializer = store.serializerFor('event');

    var result = serializer.normalizeArrayResponse(store, store.modelFor('event'), {
      events: [{ id: '1', venueId: '2' }, { id: '2', venueId: '2' }, { id: '3', venueId: '3' }],
      venues: [{ id: '2' }, { id: '3' }]
    }, null, 'findAll');

    assert.deepEqual(result, {
      data: [{
        type: 'event',
        id: '1',
        attributes: { venue: { id: '2' } },
        relationships: {}
      }, {
        type: 'event',
        id: '2',
        attributes: { venue: { id: '2' } },
        relationships: {}
      }, {
        type: 'event',
        id: '3',
        attributes: { venue: { id: '3' } },
        relationships: {}
      }],
      included: []
    });
  });
});
define('dummy/tests/unit/serializers/marketing-membership-test', ['ember-metal/get', 'ember-runloop', 'ember-qunit'], function (_get, _emberRunloop, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('marketing-membership', 'Unit | Serializer | marketing membership', {
    needs: ['serializer:marketing-membership']
  });

  (0, _emberQunit.test)('it serializes records', function (assert) {
    var serializer = this.store().serializerFor('marketing-membership');
    var record = this.subject({
      id: '1',
      userId: '1234',
      orgId: '2345',
      emailSubscription: true
    });

    var resultHash = {};
    serializer.serializeIntoHash(resultHash, { modelName: 'marketing-membership' }, record._internalModel.createSnapshot(), {});

    assert.deepEqual(resultHash, {
      membership: {
        id: '1',
        userId: '1234',
        orgId: '2345',
        emailSubscription: true,
        userUuid: '1234'
      }
    });
  });

  (0, _emberQunit.test)('it deserializes records', function (assert) {
    var store = this.store();
    var serializer = store.serializerFor('marketing-membership');

    var record = (0, _emberRunloop.default)(function () {
      store.pushPayload(serializer.normalizeQueryRecordResponse(store, 'marketing-membership', {
        memberships: [{
          id: '1',
          userId: '1234',
          orgId: '2345',
          emailSubscription: true
        }]
      }, null, 'queryRecord'));

      return store.peekRecord('marketing-membership', '1');
    });

    assert.equal((0, _get.default)(record, 'id'), '1');
  });
});
define('dummy/tests/unit/serializers/ticket-test', ['ember-runloop', 'ember-qunit'], function (_emberRunloop, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('ticket', 'Unit | Serializer | ticket', {
    needs: ['serializer:ticket', 'model:ticket', 'model:ticket-transfer', 'model:event']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it gets the ticket-transfer relationship from transferState', function (assert) {
    var store = this.store();
    (0, _emberRunloop.default)(store, 'pushPayload', 'ticket', {
      ticket: {
        id: '1',
        transferState: {
          transferId: '1'
        }
      }
    });

    assert.ok(store.peekRecord('ticket', '1').belongsTo('transfer').id(), '1');
  });
});
define('dummy/tests/unit/serializers/ticket-transfer-test', ['ember-runloop', 'ember-qunit'], function (_emberRunloop, _emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('ticket-transfer', 'Unit | Serializer | ticket transfer', {
    needs: ['serializer:ticket-transfer', 'serializer:application', 'model:ticket-transfer', 'model:ticket', 'model:event']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it serializes related ticket IDs', function (assert) {
    var store = this.store();
    (0, _emberRunloop.default)(store, 'pushPayload', 'ticket', {
      ticket: {
        id: '1'
      }
    });

    var ticket = (0, _emberRunloop.default)(store, 'peekRecord', 'ticket', '1');
    var record = this.subject({
      tickets: [ticket]
    });

    var _record$serialize = record.serialize(),
        ticketIds = _record$serialize.ticketIds;

    assert.deepEqual(ticketIds, ['1']);
  });
});
define('dummy/tests/unit/serializers/user-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForModel)('user', 'Unit | Serializer | user', {
    needs: ['serializer:application', 'serializer:user', 'service:metrics']
  });

  (0, _emberQunit.test)('it serializes with all required attributes', function (assert) {
    var record = this.subject({
      id: '1',
      firstName: 'Spencer',
      lastName: 'Price',
      email: 'spencer.price@ticketfly.com'
    });

    assert.deepEqual(record.serialize(), {
      id: '1',
      firstName: 'Spencer',
      lastName: 'Price',
      email: 'spencer.price@ticketfly.com'
    });
  });
});
define('dummy/tests/unit/services/transfers-test', ['ember-qunit', 'dummy/tests/helpers/test-module-for-engine'], function (_emberQunit, _testModuleForEngine) {
  'use strict';

  (0, _testModuleForEngine.moduleFor)('service:transfers', 'Unit | Service | transfers', {});

  (0, _emberQunit.test)('it can get and set transfer state', function (assert) {
    var service = this.subject();

    service.setTransferState({ tickets: [], email: 'test', message: 'Hello!' });

    assert.deepEqual(service.getTransferState(), {
      tickets: [],
      email: 'test',
      message: 'Hello!'
    });
  });
});
require('dummy/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
