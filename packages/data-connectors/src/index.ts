export interface ConnectorConfig {
  apiKey: string;
}

export type Connector = (config: ConnectorConfig) => Promise<void>;

import fetch from 'node-fetch';
export * from './tfHelper';
export * from './blockchain';
export * from './kafka';
export * from './kinesis';

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

export async function shopifyConnector(config: ConnectorConfig) {
  const res = await fetch(
    'https://example.myshopify.com/admin/api/2023-04/shop.json',
    {
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': config.apiKey },
    }
  );
  if (!res.ok) throw new Error('Shopify request failed');
}

export async function quickBooksConnector(config: ConnectorConfig) {
  const res = await fetch('https://quickbooks.api.intuit.com/v3/company', {
    method: 'GET',
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) throw new Error('QuickBooks request failed');
}

export async function zendeskConnector(config: ConnectorConfig) {
  const res = await fetch('https://example.zendesk.com/api/v2/tickets.json', {
    method: 'GET',
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!res.ok) throw new Error('Zendesk request failed');
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
