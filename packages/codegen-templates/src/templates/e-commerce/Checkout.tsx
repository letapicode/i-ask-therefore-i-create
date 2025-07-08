import React from 'react';
import { stripeConnector } from '@iac/data-connectors';

export interface CartItem {
  name: string;
  price: number;
}

export default function Checkout({ items, stripeKey }: { items: CartItem[]; stripeKey: string }) {
  const pay = async () => {
    await stripeConnector({ apiKey: stripeKey });
    alert('Payment processed');
  };

  return (
    <div>
      <h2>Checkout</h2>
      <button onClick={pay}>Pay Now</button>
    </div>
  );
}
