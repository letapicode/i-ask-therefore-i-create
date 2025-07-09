# Pricing Service

Provides simple multi-cloud cost estimates and recommendations.

## Endpoints

- `GET /estimate?provider=aws&region=us-east-1&cpu=10&memory=20` – returns cost estimate based on hours of CPU and GB of memory.
- `GET /recommend?cpu=10&memory=20&regions=us-east-1,europe-west1&failover=true` – compares all providers and returns the cheapest option.

Prices are loaded from `prices.json` and cached in `.cache.json` for 24 hours.

Run `pnpm start --filter pricing-service` to launch the service on port 3008.
