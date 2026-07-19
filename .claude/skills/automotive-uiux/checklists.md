# Automotive UI/UX — Review Checklist

## Core Checklist
- [ ] All colors come from T.
- [ ] New interactive elements reuse existing primitives where applicable.
- [ ] New screen verified in RTL Arabic (default) before LTR.
- [ ] No dangerouslySetInnerHTML on untrusted text.

## Do
- [ ] Use `T` tokens exclusively for color.
- [ ] Reuse `Btn`/`Card`/`Badge`/`Input`/`Modal`/`Tabs`/`Section` for anything matching their purpose.
- [ ] Design and test RTL first.

## Don't (verify avoided)
- [ ] Avoided: Don't hardcode a hex color that duplicates an existing `T` token under a different literal value.
- [ ] Avoided: Don't build a new one-off button/card style when `Btn`/`Card` already covers the case.

## Common Mistakes to Re-check
- [ ] Not repeating: Adding a slightly-different hex value for what is effectively the same navy/gold token, causing subtle inconsistency across screens.
- [ ] Not repeating: Building and testing a new screen only in English/LTR, then discovering RTL layout breaks (icon/text order, `flex-direction`) after the fact.
