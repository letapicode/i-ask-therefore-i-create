export interface ConnectorConfig {
  apiKey: string;
}

export type Connector = (config: ConnectorConfig) => Promise<void>;

export async function stripeConnector(config: ConnectorConfig) {
  console.log('connecting to Stripe with', config.apiKey);
}

export async function slackConnector(config: ConnectorConfig) {
  console.log('posting to Slack with', config.apiKey);
}
