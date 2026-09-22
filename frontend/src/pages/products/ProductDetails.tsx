import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageLoader from "../../components/common/PageLoader";
import ProductImage from "../../components/common/ProductImage";
import { useAddToCart } from "../../hooks/useAddToCart";
import { useProduct } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/format";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const addToCart = useAddToCart();
  const { product, status, error } = useProduct(id);
  const [quantity, setQuantity] = useState(1);

  if (status === "loading") return <PageLoader label="Loading product…" />;
  if (status === "failed" || !product) {
    return (
      <div className="card empty">
        <h2>Product not found</h2>
        <p className="muted">{error ?? "This product may have been removed."}</p>
        <Link to="/" className="btn btn-primary">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;

  return (
    <section>
      <Link to="/" className="back-link">
        ← All products
      </Link>
      <div className="detail">
        <ProductImage product={product} large />
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="price price-large">{formatPrice(product.price)}</p>
          <p>{product.description || "No description provided."}</p>
          <p className={outOfStock ? "stock stock-out" : "stock"}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </p>

          <div className="detail-actions">
            <div className="qty" aria-label="Quantity">
              <button className="btn btn-ghost" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button className="btn btn-ghost" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button className="btn btn-primary" disabled={outOfStock} onClick={() => addToCart(product.id, quantity)}>
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
