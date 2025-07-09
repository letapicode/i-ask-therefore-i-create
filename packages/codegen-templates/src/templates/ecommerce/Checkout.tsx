import React from 'react';
import { stripeConnector } from '@iac/data-connectors';

export interface CartItem {
  name: string;
  price: number;
}

export interface CheckoutProps {
  items: CartItem[];
  stripeKey: string;
  analyticsUrl?: string;
}

export function Checkout({ items, stripeKey, analyticsUrl }: CheckoutProps) {
  const pay = async () => {
    await stripeConnector({ apiKey: stripeKey });
    if (analyticsUrl) {
      await fetch(`${analyticsUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'purchase', value: items.length }),
      });
    }
    alert('Payment processed');
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={pay}>Pay Now</button>
    </div>
  );
}
