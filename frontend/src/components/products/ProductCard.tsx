import { Link } from "react-router-dom";
import { useAddToCart } from "../../hooks/useAddToCart";
import type { Product } from "../../types/product.types";
import { formatPrice } from "../../utils/format";
import ProductImage from "../common/ProductImage";

export default function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const outOfStock = product.stock === 0;

  return (
    <article className="card product-card">
      <Link to={`/products/${product.id}`} className="product-image-link" aria-label={`View ${product.name}`}>
        <ProductImage product={product} />
      </Link>
      <div className="product-card-body">
        <h3 className="product-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="muted clamp-2">{product.description}</p>
        <div className="product-card-footer">
          <div>
            <strong className="price">{formatPrice(product.price)}</strong>
            <div className={outOfStock ? "stock stock-out" : "stock"}>
              {outOfStock ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
            </div>
          </div>
          <button className="btn btn-primary" disabled={outOfStock} onClick={() => addToCart(product.id)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
