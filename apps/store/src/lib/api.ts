import axios from "axios";
import type {
  AppRelease,
  AppReleaseChannel,
  AppReleasePlatform,
  AssetMetadata,
  AssetType,
  AuthTokens,
  CurrentUser,
  InstalledAsset,
  StoreAsset,
  StoreCartItem,
  StoreEntitlement,
  StoreWishlistItem
} from "@markdown-canvas/shared";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
  timeout: 8000
});

export async function getAssets(): Promise<StoreAsset[]> {
  const response = await api.get<StoreAsset[]>("/assets");
  return response.data;
}

export interface CreateAssetPayload {
  title: string;
  type: AssetType;
  metadata: AssetMetadata;
  filePath: string;
  pricingType: "FREE" | "PAID";
  priceCents: number;
  currency: string;
}

export async function createAsset(payload: CreateAssetPayload, accessToken: string): Promise<StoreAsset> {
  const response = await api.post<StoreAsset>("/assets", payload, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function getReviewAssets(accessToken: string): Promise<StoreAsset[]> {
  const response = await api.get<StoreAsset[]>("/assets/admin/review", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function submitAssetForReview(assetId: string, accessToken: string): Promise<StoreAsset> {
  const response = await api.post<StoreAsset>(`/assets/${assetId}/submit-review`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function approveAsset(assetId: string, accessToken: string): Promise<StoreAsset> {
  const response = await api.post<StoreAsset>(`/assets/${assetId}/approve`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function rejectAsset(assetId: string, accessToken: string): Promise<StoreAsset> {
  const response = await api.post<StoreAsset>(`/assets/${assetId}/reject`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function getAsset(id: string): Promise<StoreAsset> {
  const response = await api.get<StoreAsset>(`/assets/${id}`);
  return response.data;
}

export async function login(email: string, password: string): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
  const response = await api.post<{ user: CurrentUser; tokens: AuthTokens }>("/auth/login", { email, password });
  return response.data;
}

export async function register(email: string, password: string): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
  const response = await api.post<{ user: CurrentUser; tokens: AuthTokens }>("/auth/register", { email, password });
  return response.data;
}

export async function getMe(accessToken: string): Promise<CurrentUser> {
  const response = await api.get<CurrentUser>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function installAsset(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/install`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function getInstalledAssets(accessToken: string): Promise<InstalledAsset[]> {
  const response = await api.get<InstalledAsset[]>("/assets/me/installed", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function getEntitlements(accessToken: string): Promise<StoreEntitlement[]> {
  const response = await api.get<StoreEntitlement[]>("/assets/me/entitlements", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function getWishlist(accessToken: string): Promise<StoreWishlistItem[]> {
  const response = await api.get<StoreWishlistItem[]>("/assets/me/wishlist", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function addWishlist(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/wishlist`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function removeWishlist(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/wishlist`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function getCart(accessToken: string): Promise<StoreCartItem[]> {
  const response = await api.get<StoreCartItem[]>("/assets/me/cart", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function addCart(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/cart`, undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function removeCart(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/cart`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}

export async function checkoutFreeCart(accessToken: string): Promise<StoreEntitlement[]> {
  const response = await api.post<StoreEntitlement[]>("/assets/me/cart/checkout-free", undefined, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return response.data;
}

export async function getAppReleases(): Promise<AppRelease[]> {
  const response = await api.get<AppRelease[]>("/app/releases");
  return response.data;
}

export async function getLatestAppRelease(platform: AppReleasePlatform, channel: AppReleaseChannel = "stable"): Promise<AppRelease> {
  const response = await api.get<AppRelease>("/app/releases/latest", {
    params: { platform, channel }
  });
  return response.data;
}
