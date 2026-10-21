# Phase 10 Production Go-Live Checklist

## Already implemented in this package
- Responsive browser UI
- Primary/Revised/CAD/Final status flow
- Supabase Auth client integration
- User-owned calculation persistence
- RLS SQL
- Local fallback mode
- JSON-ready payload model
- SaaS plan scaffolding
- Tech-pack mapping layer
- CAD comparison
- approval records in payload
- export-ready data

## External account activations still required
These cannot be embedded safely in source code and require the account owner:
- Supabase project URL + publishable key
- production email/auth settings
- custom domain DNS
- payment provider account / webhook secrets if billing is enabled
- real OCR/AI API endpoint/key for image/PDF interpretation

## Render
For the current OCMS Render static site:
- Build Command: blank
- Publish Directory: `.`
- Branch: `main`

Replace `index.html`, `style.css`, `app.js`, add `config.js`, and commit. Render auto-deploys.

## Security
- Enable HTTPS only (Render does this by default).
- Keep service-role/private keys server-side only.
- Keep RLS enabled on every user-data table.
- Use strong password/email confirmation settings.
- Review Supabase security advisors after schema deployment.
