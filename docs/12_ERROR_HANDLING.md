# Error Handling

## Philosophy

Errors should be predictable.

Users should always know

what happened

why

what to do next

---

## Categories

Validation

Authentication

Authorization

Network

Server

Unexpected

Each category should present appropriate UI.

---

## Validation Errors

Display near the field.

Avoid generic messages.

---

## Authentication Errors

Redirect when appropriate.

Allow re-authentication.

---

## Authorization Errors

Explain lack of permission.

Do not expose implementation details.

---

## Server Errors

Display friendly messages.

Log technical details separately.

---

## Network Errors

Allow retry.

Preserve user input whenever possible.

---

## Query Errors

TanStack Query should own retry behavior.

Avoid custom retry loops.

---

## Notifications

Success

Warning

Error

Information

should remain visually consistent across the application.

---

## Logging

Frontend logs should assist debugging.

Backend logs remain the authoritative audit source.

---

## AI Rule

Never swallow errors.

Never ignore rejected promises.

Every failure should result in one of

user feedback

retry

recovery

logging