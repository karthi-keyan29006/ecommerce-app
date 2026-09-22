const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });

export const formatPrice = (value: number) => currency.format(value);
export const formatDate = (iso: string) => dateTime.format(new Date(iso));

/** Two-letter initials used for the product image placeholder (skips words like "27-inch" or "4K"). */
export const initials = (name: string) => {
  const words = name.split(/\s+/).filter((word) => /^[A-Za-z]/.test(word));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
};

/** Stable hue (0-359) from a string, so each product keeps the same placeholder colour. */
export const hueFromString = (value: string) => {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
};
