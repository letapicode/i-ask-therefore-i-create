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
- `status.tsx` – check the current status of a code generation job.
