import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AssetsPage from "./pages/AssetsPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import CartPage from "./pages/CartPage";
import LibraryPage from "./pages/LibraryPage";
import WishlistPage from "./pages/WishlistPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MePage from "./pages/MePage";
import DownloadPage from "./pages/DownloadPage";
import DeveloperNewAssetPage from "./pages/DeveloperNewAssetPage";
import DeveloperAssetsPage from "./pages/DeveloperAssetsPage";
import AdminPage from "./pages/AdminPage";
import AdminReviewPage from "./pages/AdminReviewPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/assets" element={<AssetsPage />} />
      <Route path="/assets/:id" element={<AssetDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/me" element={<MePage />} />
      <Route path="/download" element={<DownloadPage />} />
      {/* 개발자 */}
      <Route path="/developer/assets" element={<DeveloperAssetsPage />} />
      <Route path="/developer/assets/new" element={<DeveloperNewAssetPage />} />
      {/* 관리자 */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/review" element={<AdminReviewPage />} />
    </Routes>
  );
}