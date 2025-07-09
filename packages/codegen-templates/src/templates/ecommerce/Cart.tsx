import React from 'react';

export interface CartItem {
  name: string;
  price: number;
}

export interface CartProps {
  items: CartItem[];
  onCheckout: () => void;
}

export function Cart({ items, onCheckout }: CartProps) {
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return (
    <div>
      <h2>Cart</h2>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            {it.name} - ${it.price.toFixed(2)}
          </li>
        ))}
      </ul>
      <strong>Total: ${total.toFixed(2)}</strong>
      <button onClick={onCheckout}>Checkout</button>
    </div>
  );
}
