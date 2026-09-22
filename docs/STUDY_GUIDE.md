# Study Guide – understand every part before the interview

Read this with the code open next to it. The goal is that you can explain **why** each piece exists, not just what it does.

---

## 1. The 6 ideas the whole assignment is about

| Idea | One-sentence explanation | Where to look |
|---|---|---|
| **Authentication** | Proving *who you are* (email + password → JWT). | `backend/src/modules/auth/auth.service.ts` |
| **Authorization / RBAC** | Deciding *what you may do* based on your role. | `middleware/auth.ts` → `authorize()`, `config/roles.ts` |
| **JWT** | A signed string the server gives you after login; you send it back with each request. | `utils/jwt.ts` |
| **Validation** | Never trust input: check it before using it. | every `*.schema.ts` (Zod) |
| **State management** | One central place in the browser that holds data (user, cart, loading, errors). | `frontend/src/store/` |
| **HOC** | A function that wraps a component to add behaviour (like "only for logged-in users"). | `frontend/src/hoc/` |

---

## 2. Follow one request end to end: "Add to cart"

1. Customer clicks **Add to cart** → `ProductCard.tsx` calls `useAddToCart()`.
2. Guest? → redirected to `/login`. Logged in? → `dispatch(addToCart({ productId, quantity }))`.
3. `cartSlice.ts` → thunk → `cartService.addItem()` → Axios `POST /cart/items` (the interceptor adds the JWT).
4. Server: `cart.routes.ts` → `authenticate` (valid token?) → `validate` (Zod: is `productId` a UUID, is quantity 1–99?) → `cart.controller.ts` → `cart.service.ts`.
5. Service loads the product (404 if missing), checks stock (400 if not enough), saves the cart row, returns the whole cart.
6. Slice stores the new cart → the navbar badge and cart page update automatically.
7. If anything failed, the message goes to `uiSlice` → a red toast appears.

---

## 3. Backend concepts in plain words

**Why routes → controller → service?**
Routes only describe URLs and which middleware runs. Controllers only translate HTTP (read request, send response). Services hold the real rules (stock checks, permissions). This keeps each file small and lets you change one layer without touching the others.

**Why `authenticate` loads the user from the database?**
The token contains the role, but if an admin changes someone's role or deletes an account, a still-valid token would keep the old power. Reloading the user makes changes effective immediately.

**Why does login say "Invalid email or password" for both cases?**
So an attacker cannot use the login form to find out which emails are registered.

**Why bcrypt?**
It is deliberately slow and adds a random salt, so stolen hashes are very hard to crack. Passwords are never stored or returned in plain text (`passwordHash` is `select: false`).

**Why can public registration not choose a role?**
If it could, anyone could sign up as Super Admin. Register always creates a `CUSTOMER`; the request body's `role` is ignored (the smoke test checks this).

**Why a database transaction for checkout?**
Checkout does 4 things: create the order, copy the lines, reduce stock, empty the cart. In a transaction they all succeed or all roll back. Row locking (`pessimistic_write`) stops two customers buying the last item at once.

**Why copy name and price into `booking_items`?**
So an old order still shows what the customer really paid, even if the product changes later.

**Why 401 vs 403?**
`401` = "I don't know who you are" (no/invalid token). `403` = "I know who you are, but you are not allowed".

**Why one error middleware?**
Every error leaves the API in the same JSON shape, and unexpected errors never leak stack traces in production.

---

## 4. Frontend concepts in plain words

**Why Redux Toolkit and not just `useState`?**
The user, the cart and the loading/error status are needed in many unrelated components (navbar, cart page, product cards). A store gives one source of truth.

**What is a thunk?**
A function that does async work (an API call) and dispatches actions for "started", "succeeded" and "failed". `createApiThunk` is a tiny wrapper so every call handles errors the same way.

**Why a separate `api/` (service) layer?**
Components should not know URLs or Axios details. If an endpoint changes, you edit one service file.

**What does the Axios interceptor do?**
Request side: adds the JWT header. Response side: if the server answers `401`, the token is dead → log out and show a message.

**How does the session survive a page refresh?**
The token is in `localStorage`. On startup, `App.tsx` sees a token but no user and calls `GET /auth/me`. While that runs, `initialized` is `false`, so `withAuth` shows a loader instead of flashing the login page.

**How does `withRole` work?**
`withRole(Page, roles)` returns a component that first runs `withAuth` (logged in?) and then checks `roles.includes(user.role)`. It is a HOC built by composing another HOC.

**Are HOCs real security?**
No. They only hide screens. Anyone can call the API directly, so the **server** re-checks roles on every request.

---

## 5. Likely interview questions (with short answers)

1. **How does JWT authentication work?** Login verifies the password and returns a signed token containing the user id and role. The client sends it in the `Authorization` header; the server verifies the signature and expiry on every request.
2. **Where do you enforce roles?** On the server, in the `authorize` middleware. The UI hiding is only for convenience.
3. **What is in your JWT?** The user id (`sub`), the role, and an expiry. Never the password or sensitive data.
4. **How do you prevent SQL injection?** TypeORM uses parameterised queries; search text goes through `:q` parameters, never string concatenation.
5. **How do you store passwords?** bcrypt with a salt (10 rounds); only the hash is stored and it is excluded from queries by default.
6. **Where would you store the token in production?** An httpOnly, secure cookie (plus refresh tokens) to reduce XSS risk. `localStorage` is used here for simplicity.
7. **How do you avoid overselling stock?** Transaction + `pessimistic_write` lock on product rows during checkout.
8. **What is a HOC and why use one here?** A function that takes a component and returns an enhanced one. Here it removes repeated "is the user logged in / allowed?" code from every page.
9. **How does your app handle errors?** Server: Zod → 400 with field messages, `AppError` for known cases, central handler for the rest. Client: thunks reject with a readable message, slices store it, `uiSlice` shows a toast.
10. **What would you improve with more time?** Refresh tokens, migrations instead of `synchronize`, rate-limiting on login, automated unit/integration tests in CI, Swagger docs, image uploads.
11. **Why is `CUSTOMER` an extra role?** Shoppers need an identity that has no employee permissions, and public registration must never create an employee.
12. **Difference between `PUT` and `PATCH`?** `PUT` replaces a resource (product update); `PATCH` changes part of it (booking status).

---

## 6. Do this before the interview

* Run the app, log in as every role, and try to open `/dashboard` and `/employees` – see who gets blocked.
* Run `npm run test:api` and read `scripts/smoke-test.js`: it is a list of every rule the API enforces.
* Change one rule yourself (for example let Manager see Admins in `config/roles.ts`) and watch the UI and API follow. Being able to make a small live change is the best proof you understand the code.
