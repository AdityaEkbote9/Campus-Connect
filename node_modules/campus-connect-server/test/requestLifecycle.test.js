import test from "node:test";
import assert from "node:assert/strict";
import { REQUEST_STATUSES, canTransitionRequest } from "../src/utils/requestLifecycle.js";

test("request lifecycle allows only the intended demo transitions", () => {
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.PENDING, REQUEST_STATUSES.ACCEPTED),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.PENDING, REQUEST_STATUSES.MAYBE_LATER),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.PENDING, REQUEST_STATUSES.CANCELLED),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.MAYBE_LATER, REQUEST_STATUSES.ACCEPTED),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.ACCEPTED, REQUEST_STATUSES.COMPLETED),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.ACCEPTED, REQUEST_STATUSES.CANCELLED),
    true
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.COMPLETED, REQUEST_STATUSES.CANCELLED),
    false
  );
  assert.equal(
    canTransitionRequest(REQUEST_STATUSES.CANCELLED, REQUEST_STATUSES.ACCEPTED),
    false
  );
});
