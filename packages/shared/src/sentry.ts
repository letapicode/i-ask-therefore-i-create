import * as Sentry from '@sentry/node';

export function initSentry(service: string) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({ dsn, tracesSampleRate: 1.0, environment: service });
}
