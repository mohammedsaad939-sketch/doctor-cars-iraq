# Automotive AI — Review Checklist

## Core Checklist
- [ ] Disclaimer shown alongside AI-generated content.
- [ ] No provider API key in client bundle.
- [ ] Diagnosis links to a real next step (workshop/emergency) for anything safety-relevant.

## Do
- [ ] Disclaim AI-generated diagnosis/estimates clearly.
- [ ] Proxy any real model calls through a backend.

## Don't (verify avoided)
- [ ] Avoided: Don't present a diagnosis/price estimate as certain/authoritative.
- [ ] Avoided: Don't embed provider API keys client-side.

## Common Mistakes to Re-check
- [ ] Not repeating: Shipping a confident-sounding single-number price estimate with no visible basis (inputs used) or range.
- [ ] Not repeating: Adding a "quick fix" that calls an AI provider directly from the browser with an embedded key.
