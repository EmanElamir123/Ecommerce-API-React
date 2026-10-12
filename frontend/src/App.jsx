import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoute from "./components/common/AdminRoute";

import Home from "./pages/Home";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrderLookup from "./pages/admin/AdminOrderLookup";

export default function App() {
  return (
    <>
      {/* إشعارات التوست بتظهر فوق كل الصفحات */}
      <ToastContainer position="top-left" rtl autoClose={3000} theme="colored" />

      <Routes>
        <Route element={<Layout />}>
          {/* صفحات عامة */}
          <Route index element={<Home />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          {/* صفحات محتاجة تسجيل دخول */}
          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* لوحة تحكم الأدمن - بدون Navbar/Footer العادية */}
        <Route
          path="admin"
          element={
            <AdminRoute requireAdmin={false}>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrderLookup />} />
          <Route
            path="products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="products/new"
            element={
              <AdminRoute>
                <AdminProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="products/:id/edit"
            element={
              <AdminRoute>
                <AdminProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="brands"
            element={
              <AdminRoute>
                <AdminBrands />
              </AdminRoute>
            }
          />
          <Route
            path="featured"
            element={
              <AdminRoute>
                <AdminFeatured />
              </AdminRoute>
            }
          />
          <Route
            path="users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </>
  );
}
