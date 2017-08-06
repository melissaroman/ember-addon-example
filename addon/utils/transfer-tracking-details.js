import get from 'ember-metal/get';

const eventPath = `tickets.firstObject.event`;

export default function getTransferTracking(transfer = {}) {
  const eventName = get(transfer, `${eventPath}.name`);
  const eventId = get(transfer, `${eventPath}.id`);
  const orgId = get(transfer, `${eventPath}.organizationId`);
  const orgName = get(transfer, `${eventPath}.organizationName`);

  return { eventName, eventId, orgId, orgName };
}
