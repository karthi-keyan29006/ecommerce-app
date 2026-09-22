import type { Product } from "../../types/product.types";
import { hueFromString, initials } from "../../utils/format";

/** Shows the product image, or a coloured tile with initials when there is no image URL. */
export default function ProductImage({ product, large = false }: { product: Pick<Product, "name" | "imageUrl">; large?: boolean }) {
  const className = `product-image${large ? " product-image-large" : ""}`;

  if (product.imageUrl) {
    return <img className={className} src={product.imageUrl} alt={product.name} />;
  }

  const hue = hueFromString(product.name);
  return (
    <div
      className={className}
      role="img"
      aria-label={product.name}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 55% 88%), hsl(${(hue + 40) % 360} 60% 78%))`, color: `hsl(${hue} 45% 28%)` }}
    >
      {initials(product.name)}
    </div>
  );
}
