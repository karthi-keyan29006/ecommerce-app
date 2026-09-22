import { Link } from "react-router-dom";
import type { CartItem } from "../../types/cart.types";
import { formatPrice } from "../../utils/format";
import ProductImage from "../common/ProductImage";

interface CartLineItemProps {
  item: CartItem;
  busy: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export default function CartLineItem({ item, busy, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <li className="card cart-item">
      <ProductImage product={item.product} />
      <div className="cart-item-info">
        <Link to={`/products/${item.product.id}`} className="product-title">
          {item.product.name}
        </Link>
        <span className="muted">{formatPrice(item.product.price)} each</span>
        <div className="qty">
          <button
            className="btn btn-ghost"
            aria-label={`Decrease quantity of ${item.product.name}`}
            disabled={item.quantity <= 1 || busy}
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          >
            −
          </button>
          <span aria-live="polite">{item.quantity}</span>
          <button
            className="btn btn-ghost"
            aria-label={`Increase quantity of ${item.product.name}`}
            disabled={item.quantity >= item.product.stock || busy}
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            +
          </button>
        </div>
      </div>
      <div className="cart-item-end">
        <strong>{formatPrice(item.lineTotal)}</strong>
        <button className="btn btn-danger-link" onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
    </li>
  );
}
