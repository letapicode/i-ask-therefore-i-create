# Portal Frontend

This Next.js based portal lets users sign up and log in to manage generated applications.

## Development

```bash
pnpm install
pnpm next dev --dir apps/portal/src
```

Pages are located under `src/pages`.

Additional pages:

- `create.tsx` – simple form to submit an app description and receive a job ID.
- Voice input is available on the create page for quickly dictating descriptions.
- `status.tsx` – check the current status of a code generation job.
- `apps.tsx` – list all generated apps and their current status.
- `account.tsx` – update email or password.
- `dashboard.tsx` – show analytics summaries.
- `logs.tsx` – view build logs.
- Google Analytics is loaded when `NEXT_PUBLIC_GA_ID` is set.
- `vr-preview.tsx` – inspect generated interfaces in WebXR
- `tutorial-builder.tsx` – compose in-app guides
- `ethics-dashboard.tsx` – transparency metrics overview
- `ux-optimization.tsx` – view UI/UX suggestions and adopt improvements
- `business.tsx` – monetization tips and marketing copy with cost forecasts
 - Translations loaded via `packages/i18n` when `localStorage.lang` is set.
