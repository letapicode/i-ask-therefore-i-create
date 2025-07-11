# Query Optimization

This service collects slow query statistics and suggests indexes or rewrites.

## Enable Profiling

Call `POST /stats` from your application whenever a database query runs, sending `{ appId, query, duration }` in milliseconds. The `packages/shared` helper can be used for convenience.

## Viewing Recommendations

Start the service and open `/query-optimization` in the portal to review suggestions. Click **Apply** to mark them addressed so future deployments include the optimizations.
