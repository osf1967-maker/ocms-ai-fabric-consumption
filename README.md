# OCMS AI Fabric Consumption SaaS V10 — Production Candidate

This package consolidates Phases 6–10.

## Included
- Phase 6: Supabase-ready authentication, per-user persistence, saved calculations, RLS schema, audit-ready model.
- Phase 7: Tech-pack intake, deterministic style/GSM/POM mapping, pluggable AI/OCR boundary.
- Phase 8: style/component masters, primary/revised workflow, CAD validation, double-counting guard for replacement components.
- Phase 9: RLS security model, approval statuses, audit schema, safe browser-key guidance, local fallback.
- Phase 10: deployment-ready static package for Render plus production checklist and subscription/tenant scaffolding.

## Important accuracy rule
The calculator does not claim CAD accuracy for shaped pieces unless CAD data is supplied. Complex replacement panels are flagged rather than blindly added/subtracted.

## Local Demo
Open `index.html`. It works without a backend using browser localStorage.

## SaaS Mode
1. Create a dedicated Supabase project.
2. Run `supabase_schema.sql`.
3. Put ONLY the project URL and publishable/anon key in `config.js`, or enter them in the Admin tab.
4. Deploy the folder to Render Static Site, GitHub Pages, Netlify, or another static host.

Never put a Supabase service-role key or payment-provider secret in browser code.
