# VIN Validation

A VIN (Vehicle Identification Number) is a 17-character code. This app does not currently validate
VINs anywhere in the client code — this doc defines the rule to apply wherever a VIN field is added
(e.g. `GarageScreen`, seller vehicle listings).

## Format rules
- Exactly 17 characters.
- Uppercase letters and digits only.
- Excludes the letters **I**, **O**, **Q** (to avoid confusion with 1/0) — a string containing
  these in a VIN field should be rejected or flagged.

## Checksum (North American / ISO 3779 check digit, position 9)
For a full checksum validation, weight each character (using the standard transliteration table
digits 0-9 map to themselves, letters map per ISO 3779) and confirm position 9 matches the
computed check digit modulo 11 (an "X" represents 10). Implement this as a pure, unit-testable
function (see `automotive-testing`) — do not validate VINs by regex alone if checksum accuracy
matters for fraud prevention (see `fraud-detection.md`).

## Where to enforce
- Client-side: format + checksum validation before submit, for fast user feedback.
- Server-side (RLS/constraint or a Postgres function): re-validate — never trust client validation
  alone for data integrity (see `automotive-security`).
