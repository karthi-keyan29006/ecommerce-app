/**
 * End-to-end smoke test for the API. No test framework needed (Node 18+).
 *
 * 1. Start the API   -> npm run dev
 * 2. Seed the DB     -> npm run seed
 * 3. Run this file   -> npm run test:api
 *
 * It checks the main flows AND the role rules (who is allowed / forbidden to do what).
 */
const BASE = process.env.API_URL || "http://localhost:5000";
let passed = 0;
let failed = 0;

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
};

const check = (name, condition, extra = "") => {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name} ${extra}`);
  }
};

const login = async (email, password) => (await call("POST", "/auth/login", { body: { email, password } })).data.token;

(async () => {
  console.log("\nAuth");
  const unique = `test${Date.now()}@example.com`;
  let r = await call("POST", "/auth/register", { body: { name: "Test User", email: unique, password: "Password1" } });
  check("register returns 201 + token + CUSTOMER role", r.status === 201 && r.data.token && r.data.user.role === "CUSTOMER");
  check("register never returns the password hash", !JSON.stringify(r.data).includes("passwordHash"));

  r = await call("POST", "/auth/register", { body: { name: "Test User", email: unique, password: "Password1" } });
  check("duplicate email returns 409", r.status === 409);

  r = await call("POST", "/auth/register", { body: { name: "X", email: "bad", password: "123" } });
  check("invalid register body returns 400 with field errors", r.status === 400 && Array.isArray(r.data.errors));

  r = await call("POST", "/auth/register", { body: { name: "Sneaky", email: `s${Date.now()}@example.com`, password: "Password1", role: "SUPER_ADMIN" } });
  check("cannot self-register as SUPER_ADMIN", r.status === 201 && r.data.user.role === "CUSTOMER");

  r = await call("POST", "/auth/login", { body: { email: "customer@example.com", password: "wrong-pass1" } });
  check("wrong password returns 401", r.status === 401);

  const customer = await login("customer@example.com", "Customer@123");
  const staff = await login("staff@example.com", "Staff@1234");
  const manager = await login("manager@example.com", "Manager@123");
  const admin = await login("admin@example.com", "Admin@1234");
  const superAdmin = await login("superadmin@example.com", "SuperAdmin@123");
  check("all seeded roles can log in", [customer, staff, manager, admin, superAdmin].every(Boolean));

  r = await call("GET", "/auth/me", { token: customer });
  check("GET /auth/me returns the logged-in user", r.status === 200 && r.data.user.email === "customer@example.com");
  r = await call("GET", "/auth/me", { token: "not-a-real-token" });
  check("invalid token returns 401", r.status === 401);

  console.log("\nProducts (public)");
  r = await call("GET", "/products?limit=5");
  check("guest can list products with pagination meta", r.status === 200 && r.data.data.length === 5 && r.data.meta.total >= 12);
  const productId = r.data.data[0].id;
  const secondId = r.data.data[1].id;
  r = await call("GET", "/products?search=keyboard");
  check("search filters products", r.status === 200 && r.data.data.length >= 1 && /keyboard/i.test(r.data.data[0].name));
  r = await call("GET", `/products/${productId}`);
  check("guest can view product details", r.status === 200 && r.data.product.id === productId);
  r = await call("GET", "/products/not-a-uuid");
  check("bad product id returns 400", r.status === 400);
  r = await call("GET", "/products/00000000-0000-4000-8000-000000000000");
  check("unknown product returns 404", r.status === 404);

  console.log("\nProduct management (role rules)");
  const newProduct = { name: "Test Product", description: "For tests", price: 100, stock: 5 };
  r = await call("POST", "/products", { body: newProduct });
  check("guest cannot create product (401)", r.status === 401);
  r = await call("POST", "/products", { token: staff, body: newProduct });
  check("staff cannot create product (403)", r.status === 403);
  r = await call("POST", "/products", { token: manager, body: newProduct });
  check("manager cannot create product (403)", r.status === 403);
  r = await call("POST", "/products", { token: admin, body: newProduct });
  check("admin can create product (201)", r.status === 201);
  const createdId = r.data.product?.id;
  r = await call("PUT", `/products/${createdId}`, { token: admin, body: { ...newProduct, price: 150 } });
  check("admin can update product", r.status === 200 && r.data.product.price === 150);
  r = await call("DELETE", `/products/${createdId}`, { token: superAdmin });
  check("super admin can delete product (204)", r.status === 204);

  console.log("\nCart");
  r = await call("GET", "/cart");
  check("guest cannot view cart (401)", r.status === 401);
  r = await call("POST", "/cart/items", { body: { productId, quantity: 1 } });
  check("guest cannot add to cart (401)", r.status === 401);
  r = await call("POST", "/cart/items", { token: customer, body: { productId, quantity: 2 } });
  check("customer can add to cart (201)", r.status === 201 && r.data.cart.totalItems === 2);
  r = await call("POST", "/cart/items", { token: customer, body: { productId, quantity: 1 } });
  check("adding same product again increases quantity", r.status === 201 && r.data.cart.items.length === 1 && r.data.cart.items[0].quantity === 3);
  r = await call("POST", "/cart/items", { token: customer, body: { productId, quantity: 9999 } });
  check("invalid quantity returns 400", r.status === 400);
  r = await call("POST", "/cart/items", { token: customer, body: { productId: secondId, quantity: 1 } });
  const cartItemId = r.data.cart.items.find((i) => i.product.id === secondId).id;
  r = await call("PUT", `/cart/items/${cartItemId}`, { token: customer, body: { quantity: 4 } });
  check("customer can update quantity", r.status === 200 && r.data.cart.items.find((i) => i.id === cartItemId).quantity === 4);
  r = await call("PUT", `/cart/items/${cartItemId}`, { token: staff, body: { quantity: 1 } });
  check("another user cannot touch my cart item (404)", r.status === 404);
  r = await call("DELETE", `/cart/items/${cartItemId}`, { token: customer });
  check("customer can remove item", r.status === 200 && r.data.cart.items.length === 1);

  console.log("\nBookings");
  r = await call("POST", "/bookings");
  check("guest cannot create booking (401)", r.status === 401);
  r = await call("POST", "/bookings", { token: staff });
  check("empty cart cannot be booked (400)", r.status === 400);
  r = await call("GET", `/products/${productId}`);
  const stockBeforeBooking = r.data.product.stock;
  r = await call("POST", "/bookings", { token: customer });
  check("customer can book from cart (201)", r.status === 201 && r.data.booking.items.length === 1 && r.data.booking.status === "PENDING");
  const bookingId = r.data.booking.id;
  r = await call("GET", "/cart", { token: customer });
  check("cart is empty after booking", r.data.cart.items.length === 0);
  r = await call("GET", "/bookings", { token: customer });
  check("customer sees only own bookings", r.status === 200 && r.data.data.every((b) => b.user.email === "customer@example.com"));
  r = await call("GET", "/bookings", { token: admin });
  check("admin sees all bookings", r.status === 200 && r.data.meta.total >= 1);
  r = await call("PATCH", `/bookings/${bookingId}/status`, { token: customer, body: { status: "CONFIRMED" } });
  check("customer cannot change booking status (403)", r.status === 403);
  r = await call("PATCH", `/bookings/${bookingId}/status`, { token: admin, body: { status: "CONFIRMED" } });
  check("admin can confirm booking", r.status === 200 && r.data.booking.status === "CONFIRMED");
  r = await call("PATCH", `/bookings/${bookingId}/status`, { token: admin, body: { status: "NOPE" } });
  check("invalid status returns 400", r.status === 400);
  r = await call("PATCH", `/bookings/${bookingId}/status`, { token: admin, body: { status: "CANCELLED" } });
  check("admin can cancel booking", r.status === 200 && r.data.booking.status === "CANCELLED");
  r = await call("GET", `/products/${productId}`);
  check("cancelling restores product stock", r.data.product.stock === stockBeforeBooking);

  console.log("\nEmployees & dashboard (role rules)");
  r = await call("GET", "/employees");
  check("guest cannot view employees (401)", r.status === 401);
  r = await call("GET", "/employees", { token: customer });
  check("customer cannot view employees (403)", r.status === 403);
  r = await call("GET", "/employees", { token: staff });
  check("staff cannot view employees (403)", r.status === 403);
  r = await call("GET", "/employees", { token: manager });
  check("manager sees STAFF only", r.status === 200 && r.data.data.length >= 1 && r.data.data.every((u) => u.role === "STAFF"));
  r = await call("GET", "/employees?role=ADMIN", { token: manager });
  check("manager cannot filter by ADMIN (403)", r.status === 403);
  r = await call("GET", "/employees", { token: admin });
  const adminRoles = new Set(r.data.data.map((u) => u.role));
  check("admin sees ADMIN/MANAGER/STAFF but not SUPER_ADMIN", r.status === 200 && !adminRoles.has("SUPER_ADMIN") && adminRoles.has("MANAGER"));
  r = await call("GET", "/employees?role=SUPER_ADMIN", { token: admin });
  check("admin cannot filter by SUPER_ADMIN (403)", r.status === 403);
  r = await call("GET", "/employees?role=MANAGER", { token: superAdmin });
  check("role filter works for super admin", r.status === 200 && r.data.data.every((u) => u.role === "MANAGER"));
  r = await call("GET", "/employees", { token: superAdmin });
  check("super admin sees SUPER_ADMIN too", r.status === 200 && r.data.data.some((u) => u.role === "SUPER_ADMIN"));
  r = await call("POST", "/employees", { token: manager, body: { name: "New Staff", email: `n${Date.now()}@example.com`, password: "Password1", role: "STAFF" } });
  check("manager cannot create employees (403)", r.status === 403);
  r = await call("POST", "/employees", { token: admin, body: { name: "New Admin", email: `a${Date.now()}@example.com`, password: "Password1", role: "ADMIN" } });
  check("admin cannot create another ADMIN (403)", r.status === 403);
  r = await call("POST", "/employees", { token: admin, body: { name: "New Staff", email: `st${Date.now()}@example.com`, password: "Password1", role: "STAFF" } });
  check("admin can create STAFF (201)", r.status === 201 && r.data.employee.role === "STAFF");

  r = await call("GET", "/admin/dashboard", { token: manager });
  check("manager cannot open dashboard (403)", r.status === 403);
  r = await call("GET", "/admin/dashboard", { token: admin });
  check(
    "admin gets dashboard statistics",
    r.status === 200 && typeof r.data.stats.totalBookings === "number" && typeof r.data.stats.totalProducts === "number" && typeof r.data.stats.totalEmployees === "number"
  );

  r = await call("GET", "/nope");
  check("unknown route returns 404 JSON", r.status === 404 && r.data.message);

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error("Smoke test crashed. Is the API running?", error.message);
  process.exit(1);
});
