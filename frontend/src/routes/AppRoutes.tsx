import { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import LoadingBar from "../components/common/LoadingBar";
import Navbar from "../components/common/Navbar";
import ToastHost from "../components/common/ToastHost";
import { withAuth } from "../hoc/withAuth";
import { withGuestOnly } from "../hoc/withGuestOnly";
import { withRole } from "../hoc/withRole";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import Dashboard from "../pages/admin/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Bookings from "../pages/bookings/Bookings";
import Cart from "../pages/cart/Cart";
import Employees from "../pages/employees/Employees";
import NotFound from "../pages/NotFound";
import ProductDetails from "../pages/products/ProductDetails";
import ProductList from "../pages/products/ProductList";
import Unauthorized from "../pages/Unauthorized";
import { ADMIN_ROLES, EMPLOYEE_VIEWER_ROLES } from "../utils/permissions";

/**
 * Access rules for every screen live in these few lines (HOCs wrap the page components).
 *  - public:        ProductList, ProductDetails
 *  - guests only:   Login, Register
 *  - logged in:     Cart, Bookings
 *  - by role:       Employees (Manager+), Dashboard (Admin+)
 */
const LoginRoute = withGuestOnly(Login);
const RegisterRoute = withGuestOnly(Register);
const CartRoute = withAuth(Cart);
const BookingsRoute = withAuth(Bookings);
const EmployeesRoute = withRole(Employees, EMPLOYEE_VIEWER_ROLES);
const DashboardRoute = withRole(Dashboard, ADMIN_ROLES);

function Layout() {
  const { user } = useAuth();
  const { fetch: fetchCart } = useCart();

  // Load the cart whenever a user logs in (for the badge in the navbar).
  const userId = user?.id;
  useEffect(() => {
    if (userId) void fetchCart();
  }, [userId, fetchCart]);

  return (
    <>
      <LoadingBar />
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <ToastHost />
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProductList />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="login" element={<LoginRoute />} />
        <Route path="register" element={<RegisterRoute />} />
        <Route path="cart" element={<CartRoute />} />
        <Route path="orders" element={<BookingsRoute />} />
        <Route path="employees" element={<EmployeesRoute />} />
        <Route path="dashboard" element={<DashboardRoute />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
