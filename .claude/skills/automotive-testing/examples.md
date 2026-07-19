# Automotive Testing — Examples

## Worked Example
```js
import { describe, it, expect } from "vitest";
import { toWhatsAppNumber } from "./theme";

describe("toWhatsAppNumber", () => {
  it("converts a local 0-prefixed number to 964-prefixed", () => {
    expect(toWhatsAppNumber("07701234567")).toBe("9647701234567");
  });
  it("passes through an already-964 number unchanged", () => {
    expect(toWhatsAppNumber("9647701234567")).toBe("9647701234567");
  });
});
```

## Prompt Templates
- "Write Vitest unit tests for utils/theme.js's toWhatsAppNumber and relativeTime, covering edge cases like a phone number already starting with 964 or 0."
- "Add a mocked-Supabase test for App.jsx's handleCartAdd covering the unique-violation fallback path."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
