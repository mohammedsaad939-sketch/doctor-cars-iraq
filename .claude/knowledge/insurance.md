# Insurance

Not yet implemented in this codebase. Referenced only conceptually (vehicle records in
`GarageScreen` could eventually link to insurance policy tracking/reminders).

## Considerations for future implementation
- Start with the lowest-risk version: a reminder system for policy renewal dates tied to a
  vehicle record (`vehicle-schema.md`), not an actual insurance-issuance integration.
- Do not store sensitive policy documents/numbers without confirming encryption-at-rest and access
  policy requirements first.
