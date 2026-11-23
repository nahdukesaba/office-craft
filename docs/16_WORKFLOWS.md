# Workflow Model

## Philosophy

Office Craft models workflows.

Workflows represent business progress.

Not UI progress.

---

## Generic Lifecycle

Created

↓

Submitted

↓

Reviewed

↓

Approved / Rejected

↓

Completed

↓

Archived

Most future operational modules should resemble this pattern.

---

## Workflow Ownership

Backend owns workflow transitions.

Frontend displays current state.

Frontend should never assume legal transitions.

---

## State Changes

Every transition should be

validated

authorized

audited

persisted

before the frontend updates.

---

## Approval

Approval is a business action.

Not a UI action.

The backend determines

whether approval is allowed.

---

## Rejection

Rejections should capture

reason

actor

timestamp

where appropriate.

---

## Audit

Every important workflow action should be traceable.

Frontend should expose history.

Backend should own history.

---

## Notifications

Workflow transitions may trigger

notifications

emails

dashboard updates

These side effects belong to backend services.

---

## Booking Notification Links

`PUBLIC_APP_URL` is the site root for links in WhatsApp and email.

- New request to admins: `/admin/bookings/<id>` to approve or reject.
- Approved or rejected result to the owner: `/my-bookings/<id>`.
- Overdue reminder to the owner: `/my-bookings/<id>` for each booking.

Login keeps the requested page through `?redirect=`, including the SSO flow. Only same-site paths are accepted.

---

## Future Workflows

New modules should integrate into the same lifecycle instead of inventing new
patterns.