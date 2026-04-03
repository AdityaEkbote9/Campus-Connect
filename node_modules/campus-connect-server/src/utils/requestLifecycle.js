export const REQUEST_STATUSES = Object.freeze({
  PENDING: "pending",
  MAYBE_LATER: "maybe_later",
  ACCEPTED: "accepted",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
});

const allowedTransitions = {
  [REQUEST_STATUSES.PENDING]: [
    REQUEST_STATUSES.ACCEPTED,
    REQUEST_STATUSES.MAYBE_LATER,
    REQUEST_STATUSES.CANCELLED
  ],
  [REQUEST_STATUSES.MAYBE_LATER]: [REQUEST_STATUSES.ACCEPTED, REQUEST_STATUSES.CANCELLED],
  [REQUEST_STATUSES.ACCEPTED]: [REQUEST_STATUSES.COMPLETED, REQUEST_STATUSES.CANCELLED],
  [REQUEST_STATUSES.COMPLETED]: [],
  [REQUEST_STATUSES.CANCELLED]: []
};

export const canTransitionRequest = (currentStatus, nextStatus) =>
  allowedTransitions[currentStatus]?.includes(nextStatus) ?? false;
