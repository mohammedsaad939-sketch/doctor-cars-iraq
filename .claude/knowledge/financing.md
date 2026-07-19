# Financing

Not yet implemented in this codebase. Referenced only in the project README's roadmap (no
in-app financing/installment feature exists today).

## Considerations for future implementation
- Any financing partner integration (bank/microfinance) must not collect sensitive financial
  application data through this client without a vetted, PCI/financial-compliance-aware backend —
  do not build this as a plain Supabase table without legal/compliance review.
- If a simple "request financing info" lead-capture form is built instead (much lower risk), treat
  it as a lead/contact-request record, not a financial application.
