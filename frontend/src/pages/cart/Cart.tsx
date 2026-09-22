import { Link, useNavigate } from "react-router-dom";
import CartLineItem from "../../components/cart/CartLineItem";
import PageLoader from "../../components/common/PageLoader";
import { usePlaceOrder } from "../../hooks/useBookings";
import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../utils/format";

export default function Cart() {
  const navigate = useNavigate();
  const { items, total, totalItems, isLoading, update, remove } = useCart();
  const { placing, placeOrder } = usePlaceOrder();

  const handlePlaceOrder = async () => {
    if (await placeOrder()) navigate("/orders");
  };

  if (isLoading && items.length === 0) return <PageLoader label="Loading your cart…" />;

  if (items.length === 0) {
    return (
      <div className="card empty">
        <h1>Your cart is empty</h1>
        <p className="muted">Add a few products and they will show up here.</p>
        <Link to="/" className="btn btn-primary">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <section>
      <h1>Your cart</h1>
      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => (
            <CartLineItem
              key={item.id}
              item={item}
              busy={isLoading}
              onQuantityChange={(itemId, quantity) => void update(itemId, quantity)}
              onRemove={(itemId) => void remove(itemId)}
            />
          ))}
        </ul>

        <aside className="card summary">
          <h2>Order summary</h2>
          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <button className="btn btn-primary btn-block" onClick={handlePlaceOrder} disabled={placing}>
            {placing ? "Placing order…" : "Place order"}
          </button>
        </aside>
      </div>
    </section>
  );
}
