import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import LandingPage from '@/features/landing/pages/LandingPage';
import SubscriptionConfirmedPage from '@/features/newsletter/pages/SubscriptionConfirmedPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ShopPage from '@/features/shop/pages/ShopPage';
import ProductPage from '@/features/shop/pages/ProductPage';
import CartPage from '@/features/shop/pages/CartPage';
import CheckoutPage from '@/features/shop/pages/CheckoutPage';
import OrderConfirmationPage from '@/features/shop/pages/OrderConfirmationPage';
import BlogPage from '@/features/blog/pages/BlogPage';
import ArticlePage from '@/features/blog/pages/ArticlePage';
import AccountPage from '@/features/account/pages/AccountPage';
import OrderDetailsPage from '@/features/account/pages/OrderDetailsPage';
import { AdminLayout } from '@/features/admin/layouts/AdminLayout';
import AdminDashboard from '@/features/admin/pages/AdminDashboard';
import AdminProductsPage from '@/features/admin/pages/AdminProductsPage';
import AdminProductFormPage from '@/features/admin/pages/AdminProductFormPage';
import AdminBlogPage from '@/features/admin/pages/AdminBlogPage';
import AdminArticleFormPage from '@/features/admin/pages/AdminArticleFormPage';
import AdminBlogCategoriesPage from '@/features/admin/pages/AdminBlogCategoriesPage';
import AdminOrdersPage from '@/features/admin/pages/AdminOrdersPage';
import AdminOrderDetailsPage from '@/features/admin/pages/AdminOrderDetailsPage';
import AdminSubscribersPage from '@/features/admin/pages/AdminSubscribersPage';
import AdminNewsletterPage from '@/features/admin/pages/AdminNewsletterPage';
import AdminSettingsPage from '@/features/admin/pages/AdminSettingsPage';
import AdminBackupPage from '@/features/admin/pages/AdminBackupPage';
import AdminMigratePage from '@/features/admin/pages/AdminMigratePage';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/shop/:id" element={<ProductPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={
        <ProtectedRoute><CheckoutPage /></ProtectedRoute>
      } />
      <Route path="/order/:id" element={
        <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>
      } />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<ArticlePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/subscription-confirmed" element={<SubscriptionConfirmedPage />} />

      {/* User Authorized Routes */}
      <Route path="/account" element={
        <ProtectedRoute><AccountPage /></ProtectedRoute>
      } />
      <Route path="/account/orders/:id" element={
        <ProtectedRoute><OrderDetailsPage /></ProtectedRoute>
      } />

      {/* Admin Panel Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id" element={<AdminProductFormPage />} />
        <Route path="blog" element={<AdminBlogPage />} />
        <Route path="blog/new" element={<AdminArticleFormPage />} />
        <Route path="blog/:id" element={<AdminArticleFormPage />} />
        <Route path="blog/categories" element={<AdminBlogCategoriesPage />} />
        <Route path="newsletter" element={<AdminNewsletterPage />} />
        <Route path="subscribers" element={<AdminSubscribersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="backup" element={<AdminBackupPage />} />
        <Route path="migrate" element={<AdminMigratePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
