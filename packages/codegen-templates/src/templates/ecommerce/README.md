# E-Commerce Template

This template provides a simple storefront with React components and API routes.
It uses the Stripe connector for payments and records purchase events via the
analytics service. Shipping and tax rates can be customized through environment
variables.

## Files

- `Product.tsx` – display a single product
- `Cart.tsx` – show cart contents and total
- `Checkout.tsx` – process payments and send analytics events
- `server.ts` – example Express API for products and checkout

## Setup

1. Set `STRIPE_KEY` with your Stripe secret key.
2. Optionally set `ANALYTICS_URL` to point at the analytics service.
3. Customize the `PRODUCTS`, `SHIPPING_RATE` and `TAX_RATE` constants in
   `server.ts` or via environment variables.
4. Run `ts-node server.ts` to start the API and open the React components in
your frontend.

This template can be extended to integrate marketing emails or inventory
management as needed.
