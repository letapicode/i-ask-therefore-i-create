export interface ConnectorConfig {
  apiKey: string;
}

export type Connector = (config: ConnectorConfig) => Promise<void>;

import fetch from 'node-fetch';
export * from './tfHelper';

export async function stripeConnector(config: ConnectorConfig) {
  const res = await fetch('https://api.stripe.com/v1/charges', {
    method: 'GET',
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) throw new Error('Stripe request failed');
  console.log('Stripe connected');
}

export async function slackConnector(config: ConnectorConfig) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel: '#general', text: 'hello' }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error('Slack request failed');
}

export async function appleConnector(config: ConnectorConfig) {
  const res = await fetch('https://api.appstoreconnect.apple.com/v1/apps', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ placeholder: true }),
  });
  if (!res.ok) throw new Error('Apple publish failed');
}

export async function googleConnector(config: ConnectorConfig) {
  const res = await fetch(
    'https://androidpublisher.googleapis.com/androidpublisher/v3/applications',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeholder: true }),
    }
  );
  if (!res.ok) throw new Error('Google publish failed');
}
