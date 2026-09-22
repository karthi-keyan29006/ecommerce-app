import PageLoader from "../../components/common/PageLoader";
import Pagination from "../../components/common/Pagination";
import ProductCard from "../../components/products/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export default function ProductList() {
  const { items, meta, status, error, search, setSearch, debouncedSearch, setPage } = useProducts();

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="muted">Everything for a better desk setup.</p>
        </div>
        <input
          className="input search-input"
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
        />
      </div>

      {status === "loading" && items.length === 0 ? (
        <PageLoader label="Loading products…" />
      ) : status === "failed" ? (
        <p className="error-text">{error}</p>
      ) : items.length === 0 ? (
        <p className="muted empty">No products match “{debouncedSearch}”. Try a different word.</p>
      ) : (
        <div className={`product-grid${status === "loading" ? " is-refreshing" : ""}`}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination meta={meta} onChange={setPage} />
    </section>
  );
}
