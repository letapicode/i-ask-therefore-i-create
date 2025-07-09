import React from 'react';

export interface ProductProps {
  name: string;
  price: number;
  onAdd: () => void;
}

export function Product({ name, price, onAdd }: ProductProps) {
  return (
    <div>
      <h3>{name}</h3>
      <p>${price.toFixed(2)}</p>
      <button onClick={onAdd}>Add to Cart</button>
    </div>
  );
}
