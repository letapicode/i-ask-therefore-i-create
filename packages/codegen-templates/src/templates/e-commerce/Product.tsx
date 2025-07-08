import React from 'react';

export default function Product({ name, price, onAdd }: { name: string; price: number; onAdd: () => void }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>${price.toFixed(2)}</p>
      <button onClick={onAdd}>Add to Cart</button>
    </div>
  );
}
