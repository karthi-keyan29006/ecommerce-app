# DeskShop – Full-Stack E-Commerce Application

A layered (N-tier) e-commerce app with JWT authentication and role-based access control.

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + TypeScript (Vite), Zustand, Axios, React Router |
| Backend | Node.js, Express, TypeScript, Zod (validation) |
| Database | MySQL 8 |
| ORM | Prisma |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`) |

## Quick start (submission checklist)

```bash
# 1. Database (pick one)
docker compose up -d                      # Option A: Docker MySQL
# OR create manually — see "Database" under Installation

# 2. Backend
cd backend
npm install
cp .env.example .env                      # Windows: copy .env.example .env
npm run prisma:generate
npm run db:push
npm run seed                              # creates the test users below
npm run dev                               # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                               # http://localhost:5173
```

| Item | Where |
| --- | --- |
| Environment variables | [`backend/.env.example`](backend/.env.example), [`frontend/.env.example`](frontend/.env.example) — full explanation in [§7](#7-installation-and-running) |
| Database setup | [§7 Database](#7-installation-and-running) (Docker or manual MySQL) |
| Run commands | [§7 Backend / Frontend](#7-installation-and-running) |
| Test credentials (all roles) | [§8 Sample test users](#8-sample-test-users) |

## Table of contents

1. [Architecture](#1-architecture)
2. [Folder structure and what every part does](#2-folder-structure-and-what-every-part-does)
3. [Database schema](#3-database-schema)
4. [API reference](#4-api-reference)
5. [Flows: API, backend, frontend, authentication, RBAC](#5-flows)
6. [React concepts used in this project](#6-react-concepts-used-in-this-project)
7. [Installation, environment variables and run commands](#7-installation-and-running)
8. [Sample test users](#8-sample-test-users)
9. [Design decisions](#9-design-decisions)

---

## 1. Architecture

**Backend** – each layer only talks to the layer directly below it:

```
HTTP request
  → Routes          URL + HTTP verb, wires the middleware chain
  → Middleware      authenticate (JWT) → authorize (role) → validate (Zod)
  → Controllers     read the request, call a service, send the response (no logic)
  → Services        business rules (stock checks, permissions, transactions)
  → Repositories    the ONLY place that talks to Prisma
  → Prisma / MySQL
```

**Frontend**:

```
Pages → Components → Hooks → Store (Zustand) → Services → API (Axios) → Backend
```

* Pages compose components and call hooks. Components never call Axios.
* Hooks connect UI to stores/services.
* Stores (Zustand) hold shared state (auth, cart, app UI).
* Services hold client-side business logic (token persistence, error mapping).
* `api/` files are thin HTTP calls, nothing else.

---

## 2. Folder structure and what every part does

```
ecommerce-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            database schema (models, enums, relations)
│   │   └── seed.ts                  creates the sample users and products
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          the single shared PrismaClient (+ transaction client type)
│   │   │   └── env.ts               loads and validates .env with Zod; crashes early if invalid
│   │   ├── routes/                  one file per resource; maps URL → middleware → controller
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   ├── employee.routes.ts
│   │   │   └── dashboard.routes.ts  (mounted at /admin)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts        authenticate: verifies the JWT, loads req.user
│   │   │   ├── role.middleware.ts        authorize(...roles): 403 if the role is not allowed
│   │   │   ├── validation.middleware.ts  validate({body, query, params}) with Zod schemas
│   │   │   └── error.middleware.ts       404 handler + ONE central error → JSON converter
│   │   ├── controllers/             HTTP in/out only; each handler is 1–3 lines
│   │   ├── services/                business logic; no Express, no Prisma
│   │   │   ├── auth.service.ts      register (always CUSTOMER), login, profile
│   │   │   ├── product.service.ts   list/search/paginate, CRUD, Decimal → number mapping
│   │   │   ├── cart.service.ts      add/update/remove with stock checks
│   │   │   ├── booking.service.ts   cart → booking in one transaction; cancel restores stock
│   │   │   ├── employee.service.ts  role-filtered employee list, create employee
│   │   │   └── dashboard.service.ts aggregated statistics
│   │   ├── repositories/            repository pattern: every DB query lives here
│   │   │   ├── user.repository.ts
│   │   │   ├── product.repository.ts
│   │   │   ├── cart.repository.ts
│   │   │   ├── booking.repository.ts
│   │   │   └── employee.repository.ts
│   │   ├── validators/              Zod schemas (what a valid request looks like)
│   │   ├── types/                   TypeScript types (inferred from the validators) and RBAC maps
│   │   ├── utils/
│   │   │   ├── jwt.ts               signToken / verifyToken
│   │   │   ├── password.ts          hashPassword / comparePassword (bcrypt)
│   │   │   └── response.ts          AppError, asyncHandler, sendResponse, pagination meta, toPublicUser
│   │   ├── app.ts                   builds the Express app (helmet, cors, routes, error handling)
│   │   └── server.ts                connects to the DB and starts listening
│   ├── scripts/smoke-test.js        end-to-end API check (`npm run test:api`)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              reusable UI, no API calls
│   │   │   ├── common/              Navbar, Pagination, StatusBadge, loaders, toasts…
│   │   │   ├── products/            ProductCard
│   │   │   ├── cart/                cart line item
│   │   │   └── bookings/            booking card
│   │   ├── pages/                   one component per route
│   │   │   ├── auth/                Login.tsx, Register.tsx
│   │   │   ├── products/            ProductList.tsx, ProductDetails.tsx
│   │   │   ├── cart/                Cart.tsx
│   │   │   ├── bookings/            Bookings.tsx
│   │   │   ├── employees/           Employees.tsx
│   │   │   └── admin/               Dashboard.tsx
│   │   ├── api/                     Axios instance + one thin file per backend resource
│   │   │   ├── axios.ts             baseURL, attaches the JWT, clears auth on 401
│   │   │   └── auth / product / cart / booking / employee / dashboard .api.ts
│   │   ├── services/                client business logic on top of api/ (token storage, error mapping)
│   │   ├── store/                   Zustand stores
│   │   │   ├── auth.store.ts        user + token + login/register/logout
│   │   │   ├── cart.store.ts        cart items + add/update/remove
│   │   │   └── app.store.ts         toasts and global loading counter
│   │   ├── hooks/                   useAuth, useProducts, useCart (+ small helpers)
│   │   ├── hoc/
│   │   │   ├── withAuth.tsx         redirects guests to /login
│   │   │   ├── withRole.tsx         redirects users without the right role to /unauthorized
│   │   │   └── withLoading.tsx      shows a loader while `loading` is true
│   │   ├── context/AppContext.tsx   app-wide values (app name, currency formatter, toast helper)
│   │   ├── types/                   auth / product / cart / booking types
│   │   ├── utils/
│   │   │   ├── storage.ts           safe localStorage wrapper
│   │   │   ├── constants.ts         roles, route paths, API URL
│   │   │   └── permissions.ts       role → allowed pages/actions
│   │   ├── routes/AppRoutes.tsx     the route table, protected with the HOCs
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               optional MySQL container
├── .gitignore
└── README.md
```

---

## 3. Database schema

Defined in [backend/prisma/schema.prisma](backend/prisma/schema.prisma).

```
users                         products
─────────────────             ─────────────────
id (PK, uuid)                 id (PK, uuid)
name                          name
email (UNIQUE)                description
passwordHash (bcrypt)         price   DECIMAL(10,2)
role  ENUM(SUPER_ADMIN,       stock   INT
       ADMIN, MANAGER,        imageUrl (nullable)
       STAFF, CUSTOMER)       createdAt / updatedAt
createdAt / updatedAt              │
     │ 1                           │ 1
     │                             │
     │ N        cart_items         │ N
     └────────< ─────────────── >──┘
                id (PK)
                userId → users.id     (ON DELETE CASCADE)
                productId → products.id (ON DELETE CASCADE)
                quantity
                UNIQUE(userId, productId)

users 1 ───< N bookings 1 ───< N booking_items
              id (PK)            id (PK)
              userId → users     bookingId → bookings (ON DELETE CASCADE)
              status ENUM        productId (nullable snapshot reference)
              (PENDING,          productName   ← copied at booking time
               CONFIRMED,        unitPrice     ← copied at booking time
               SHIPPED,          quantity
               DELIVERED,
               CANCELLED)
              total DECIMAL(12,2)
              createdAt
```

Booking items **copy** the product name and price so old orders stay correct even if a product is edited or deleted later.

---

## 4. API reference

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | create a CUSTOMER account, returns `{ user, token }` |
| POST | `/auth/login` | public | returns `{ user, token }` |
| GET | `/auth/me` | logged in | current user |
| GET | `/products` | public | list (`?page=&limit=&search=`) |
| GET | `/products/:id` | public | product details |
| POST / PUT / DELETE | `/products[/:id]` | ADMIN, SUPER_ADMIN | manage products |
| GET | `/cart` | logged in | own cart |
| POST | `/cart/items` | logged in | add `{ productId, quantity }` |
| PUT | `/cart/items/:id` | logged in | change quantity |
| DELETE | `/cart/items/:id` | logged in | remove item |
| POST | `/bookings` | logged in | turn the cart into a booking |
| GET | `/bookings` | logged in | own bookings (ADMIN/SUPER_ADMIN see all) |
| PATCH | `/bookings/:id/status` | ADMIN, SUPER_ADMIN | change status (cancelling restores stock) |
| GET | `/employees` | MANAGER, ADMIN, SUPER_ADMIN | employees the caller may see |
| POST | `/employees` | ADMIN, SUPER_ADMIN | create an employee |
| GET | `/admin/dashboard` | ADMIN, SUPER_ADMIN | statistics |

Status codes: `200` OK, `201` created, `204` deleted, `400` validation / business error, `401` not logged in or bad token, `403` role not allowed, `404` not found, `409` conflict (duplicate email, stock changed), `500` unexpected.
Errors always look like `{ "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

### Role access

| Role | Products | Cart / Bookings | Employees | Dashboard | Manage products |
| --- | --- | --- | --- | --- | --- |
| SUPER_ADMIN | ✔ | ✔ (all bookings) | sees all roles, creates all roles | ✔ | ✔ |
| ADMIN | ✔ | ✔ (all bookings) | sees ADMIN/MANAGER/STAFF, creates MANAGER/STAFF | ✔ | ✔ |
| MANAGER | ✔ | ✔ (own) | sees STAFF | ✘ | ✘ |
| STAFF | ✔ (list only) | ✔ (own) | ✘ | ✘ | ✘ |
| CUSTOMER | ✔ | ✔ (own) | ✘ | ✘ | ✘ |

`CUSTOMER` is an extra role beyond the four employee roles: it is what public **register** creates, so shoppers can use the cart and bookings without any employee rights.

---

## 5. Flows

### API flow (example: add to cart)

```
Cart page → useCart().addItem(id) → cart.store → cart.service → cart.api → Axios
   ── POST /cart/items + "Authorization: Bearer <jwt>" ──▶
cart.routes → authenticate → validate(addItemSchema) → cart.controller
   → cart.service (stock check) → cart.repository → Prisma → MySQL
   ◀── 201 { cart } ──  store updates → React re-renders the cart badge
```

### Backend flow

1. **Route** matches the URL and runs its middleware in order.
2. **Middleware** authenticates, authorizes and validates. Any failure calls `next(error)`.
3. **Controller** passes `req.body` / `req.user` to a service and sends the result.
4. **Service** applies business rules and calls repositories. Multi-step work (a booking) runs in one `prisma.$transaction`.
5. **Repository** runs the Prisma query.
6. **Error middleware** converts any thrown error (`AppError`, `ZodError`, Prisma errors) into one JSON shape.

### Frontend flow

1. `main.tsx` mounts the app inside `AppContext` and the router; auth state is restored from `localStorage`.
2. `AppRoutes.tsx` decides which page renders; protected pages are wrapped by `withAuth` / `withRole`.
3. A page renders components and calls hooks. Hooks read/write Zustand stores.
4. Stores call services, services call `api/*.api.ts`, and Axios talks to the backend.
5. The response updates the store; every component subscribed to it re-renders.

### Authentication flow

```
Register/Login form ──▶ POST /auth/login {email, password}
   backend: find user → bcrypt.compare → sign JWT { sub: userId, role } (expires in JWT_EXPIRES_IN)
   ◀── { user, token }
frontend: auth.store saves user + token (and localStorage via storage.ts)
every request: axios interceptor adds  Authorization: Bearer <token>
backend authenticate middleware: verify signature/expiry → load user from DB → req.user
on 401: axios interceptor clears auth and the user is sent to /login
```

Passwords are never stored or returned in plain text: only the bcrypt hash is stored, and `toPublicUser` strips it from every response. Login uses the same error message for "unknown email" and "wrong password".

### RBAC flow

```
Backend  (the real security)
  route ── authenticate ── authorize(Role.ADMIN, Role.SUPER_ADMIN) ── controller
     no/invalid token → 401          wrong role → 403
  employee visibility/creation rules → VISIBLE_EMPLOYEE_ROLES / CREATABLE_EMPLOYEE_ROLES (types/auth.types.ts)

Frontend (user experience only)
  <Route> ── withAuth (logged in?) ── withRole([ADMIN, SUPER_ADMIN]) (allowed role?) ── Page
     guest → /login          wrong role → /unauthorized
  Navbar shows only links allowed by utils/permissions.ts
```

Hiding a page in the UI is a convenience, not security. The backend always re-checks the role, and it reloads the user from the database on each request, so a demoted or deleted account loses access immediately.

---

## 6. React concepts used in this project

### Component
1. **Definition:** a reusable piece of UI: a function that returns JSX.
2. **Why:** to split the screen into small pieces that can be built, tested and reused independently.
3. **In this project:** `ProductCard`, `Pagination`, `StatusBadge`, `Navbar`, and every page.
4. **Example:**
```tsx
const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
);
```

### Props
1. **Definition:** the inputs a parent passes to a child component. They are read-only.
2. **Why:** so one component can render different data and stay reusable.
3. **In this project:** `ProductCard` receives a `product` and an `onAdd` callback; `Pagination` receives `page`, `totalPages` and `onChange`.
4. **Example:**
```tsx
interface ProductCardProps {
  product: Product;
  onAdd: (productId: string) => void;
}
const ProductCard = ({ product, onAdd }: ProductCardProps) => (
  <div>
    <h3>{product.name}</h3>
    <button onClick={() => onAdd(product.id)}>Add to cart</button>
  </div>
);
```

### State
1. **Definition:** data that changes over time; when it changes React re-renders the component.
2. **Why:** so the screen always reflects the current data (search text, page number, cart, logged-in user).
3. **In this project:** local state for the search box and page number; **global** state (Zustand) for the user, token, cart and toasts.
4. **Example:**
```tsx
const [search, setSearch] = useState("");
<input value={search} onChange={(e) => setSearch(e.target.value)} />
```

### Hooks
1. **Definition:** functions starting with `use` that let function components use state, effects and other React features. You can write your own.
2. **Why:** to share stateful logic between components without classes or copy-paste.
3. **In this project:** `useAuth`, `useProducts`, `useCart`, `useDebounce`, plus React's `useState` / `useEffect`.
4. **Example:**
```tsx
export const useProducts = (search: string, page: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    productService.list({ search, page }).then((res) => setProducts(res.data));
  }, [search, page]);
  return products;
};
```

### Functional Components
1. **Definition:** components written as plain functions (not classes). With hooks they can do everything class components could.
2. **Why:** less boilerplate, easier to read, and the modern React standard. This project uses **only** functional components.
3. **In this project:** every file in `components/`, `pages/` and `hoc/`.
4. **Example:**
```tsx
const Greeting = () => {
  const user = useAuth().user;
  return <p>Hello, {user?.name}</p>;
};
```

### HOC (Higher-Order Component)
1. **Definition:** a function that takes a component and returns a new component with extra behavior.
2. **Why:** to add cross-cutting behavior (login check, role check, loading state) without editing every page.
3. **In this project:** `withAuth` (must be logged in), `withRole` (must have a role), `withLoading` (shows a loader).
4. **Example:**
```tsx
export const withAuth = <P extends object>(Component: ComponentType<P>) => (props: P) => {
  const token = useAuthStore((s) => s.token);
  return token ? <Component {...props} /> : <Navigate to="/login" replace />;
};

// usage
const ProtectedCart = withAuth(Cart);
```

### State Management
1. **Definition:** a defined way to store and update data that many components need.
2. **Why:** passing state through many props ("prop drilling") gets messy; a store lets any component read it directly.
3. **In this project:** **Zustand** stores: `auth.store` (user/token), `cart.store` (items), `app.store` (toasts, loading). `AppContext` covers small app-wide constants.
4. **Example:**
```tsx
export const useCartStore = create<CartState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));

const count = useCartStore((s) => s.items.length); // re-renders only when this value changes
```

### API Service Layer
1. **Definition:** a separate layer of functions that talk to the backend, so UI code never calls Axios directly.
2. **Why:** the URL/HTTP details live in one place, are easy to change and test, and the UI stays simple.
3. **In this project:** `api/*.api.ts` (raw HTTP) and `services/*.service.ts` (logic on top: storage, error messages).
4. **Example:**
```ts
// api/product.api.ts
export const getProducts = (params: ProductQuery) =>
  http.get<ProductListResponse>("/products", { params }).then((r) => r.data);

// services/product.service.ts
export const productService = { list: (params: ProductQuery) => getProducts(params) };
```

### Authentication
1. **Definition:** proving **who you are** (login with email + password, then carry a token).
2. **Why:** the server must know which user is making each request (their cart, their bookings).
3. **In this project:** `POST /auth/login` returns a JWT; `auth.store` keeps it; the Axios interceptor sends it on every request; `withAuth` blocks guests.
4. **Example:**
```ts
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Authorization
1. **Definition:** deciding **what you may do** once you are known (your role).
2. **Why:** an admin dashboard must not be reachable by a customer or a staff member.
3. **In this project:** backend `authorize(...roles)` middleware (real enforcement) and frontend `withRole` (better UX).
4. **Example:**
```tsx
export const withRole = <P extends object>(roles: Role[]) => (Component: ComponentType<P>) => (props: P) => {
  const role = useAuthStore((s) => s.user?.role);
  return role && roles.includes(role) ? <Component {...props} /> : <Navigate to="/unauthorized" replace />;
};

const AdminDashboard = withRole([Role.ADMIN, Role.SUPER_ADMIN])(Dashboard);
```

---

## 7. Installation and running

**Requirements:** Node.js 18+, MySQL 8 (or Docker).

### Database

Option A – Docker:
```bash
docker compose up -d
```
Option B – existing MySQL:
```sql
CREATE DATABASE ecommerce;
CREATE USER 'shop'@'%' IDENTIFIED BY 'shop123';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'shop'@'%';
```

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run prisma:generate     # generates the Prisma client
npm run db:push             # creates the tables from schema.prisma
npm run seed                # sample users and products
npm run dev                 # http://localhost:5000
```
Other backend commands: `npm run build`, `npm start`, `npm run typecheck`, `npm run test:api` (server must be running).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

### Environment variables

`backend/.env`

| Variable | Example | Meaning |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `CLIENT_URL` | `http://localhost:5173` | origin allowed by CORS |
| `DATABASE_URL` | `mysql://shop:shop123@localhost:3306/ecommerce` | MySQL connection string |
| `JWT_SECRET` | *(long random string, 16+ chars)* | signs the tokens |
| `JWT_EXPIRES_IN` | `1d` | token lifetime |

`frontend/.env`: see `frontend/.env.example` (the API base URL, default `http://localhost:5000`).

---

## 8. Sample test users

Created by `npm run seed`:

| Role | Email | Password |
| --- | --- | --- |
| SUPER_ADMIN | superadmin@example.com | SuperAdmin@123 |
| ADMIN | admin@example.com | Admin@1234 |
| MANAGER | manager@example.com | Manager@123 |
| STAFF | staff@example.com | Staff@1234 |
| CUSTOMER | customer@example.com | Customer@123 |

---

## 9. Design decisions

* **Repository pattern:** only `repositories/` imports Prisma queries, so services stay easy to read and the database could be swapped with limited changes.
* **Transactions:** turning a cart into a booking creates the booking, reduces stock and empties the cart in one `prisma.$transaction`. Stock is reduced with `UPDATE … WHERE stock >= quantity`, which prevents overselling under concurrent requests.
* **Validation:** Zod schemas validate every body, query and param at the edge; TypeScript types are inferred from them.
* **Money:** stored as `DECIMAL`, converted to numbers at the service layer.
* **MySQL search:** `contains` filters are case-insensitive with MySQL's default collation.
