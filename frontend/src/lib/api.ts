import axios from "axios";
import type {
  AppRelease,
  AppReleaseChannel,
  AppReleasePlatform,
  AssetMetadata,
  AssetType,
  AuthTokens,
  CurrentUser,
  DeveloperApplication,
  InstalledAsset,
  StoreAsset,
  StoreCartItem,
  StoreEntitlement,
  StoreWishlistItem,
  UserProfile,
} from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  timeout: 8000,
});

// ── 에셋 ──────────────────────────────────────────────────────────────────
export async function getAssets(): Promise<StoreAsset[]> {
  return (await api.get<StoreAsset[]>("/assets")).data;
}

export async function getAsset(id: string): Promise<StoreAsset> {
  return (await api.get<StoreAsset>(`/assets/${id}`)).data;
}

export async function getReviewAssets(accessToken: string): Promise<StoreAsset[]> {
  return (await api.get<StoreAsset[]>("/assets/admin/review", auth(accessToken))).data;
}

export async function getMyAssets(accessToken: string): Promise<StoreAsset[]> {
  return (await api.get<StoreAsset[]>("/assets/me/assets", auth(accessToken))).data;
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

export interface UpdateAssetPayload {
  title?: string;
  filePath?: string;
  metadata?: AssetMetadata;
  pricingType?: "FREE" | "PAID";
  priceCents?: number;
  currency?: string;
}

export async function createAsset(payload: CreateAssetPayload, accessToken: string): Promise<StoreAsset> {
  return (await api.post<StoreAsset>("/assets", payload, auth(accessToken))).data;
}

export async function updateAsset(assetId: string, payload: UpdateAssetPayload, accessToken: string): Promise<StoreAsset> {
  return (await api.put<StoreAsset>(`/assets/${assetId}`, payload, auth(accessToken))).data;
}

export async function deleteAsset(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}`, auth(accessToken));
}

export async function submitAssetForReview(assetId: string, accessToken: string): Promise<StoreAsset> {
  return (await api.post<StoreAsset>(`/assets/${assetId}/submit-review`, undefined, auth(accessToken))).data;
}

export async function approveAsset(assetId: string, accessToken: string): Promise<StoreAsset> {
  return (await api.post<StoreAsset>(`/assets/${assetId}/approve`, undefined, auth(accessToken))).data;
}

export async function rejectAsset(assetId: string, accessToken: string): Promise<StoreAsset> {
  return (await api.post<StoreAsset>(`/assets/${assetId}/reject`, undefined, auth(accessToken))).data;
}

// ── 인증 ──────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
  return (await api.post<{ user: CurrentUser; tokens: AuthTokens }>("/auth/login", { email, password })).data;
}

export async function register(
  email: string,
  password: string,
  nickname?: string
): Promise<{ user: CurrentUser; tokens: AuthTokens }> {
  return (
    await api.post<{ user: CurrentUser; tokens: AuthTokens }>("/auth/register", { email, password, nickname })
  ).data;
}

export async function getMe(accessToken: string): Promise<CurrentUser> {
  return (await api.get<CurrentUser>("/auth/me", auth(accessToken))).data;
}

// ── 사용자 프로필 ─────────────────────────────────────────────────────────
export async function getMyProfile(accessToken: string): Promise<UserProfile> {
  return (await api.get<UserProfile>("/users/me", auth(accessToken))).data;
}

export interface UpdateProfilePayload {
  nickname?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  profilePictureUrl?: string;
}

export async function updateMyProfile(payload: UpdateProfilePayload, accessToken: string): Promise<UserProfile> {
  return (await api.put<UserProfile>("/users/me", payload, auth(accessToken))).data;
}

// ── 개발자 신청 ────────────────────────────────────────────────────────────
export async function applyForDeveloper(reason: string, accessToken: string): Promise<DeveloperApplication> {
  return (await api.post<DeveloperApplication>("/users/me/developer-application", { reason }, auth(accessToken))).data;
}

export async function getMyDeveloperApplication(accessToken: string): Promise<DeveloperApplication> {
  return (await api.get<DeveloperApplication>("/users/me/developer-application", auth(accessToken))).data;
}

// ── 관리자 ────────────────────────────────────────────────────────────────
export async function getAdminDeveloperApplications(
  accessToken: string,
  status?: string
): Promise<DeveloperApplication[]> {
  const params = status ? { status } : undefined;
  return (await api.get<DeveloperApplication[]>("/users/admin/developer-applications", { ...auth(accessToken), params })).data;
}

export async function reviewDeveloperApplication(
  appId: string,
  approve: boolean,
  note: string,
  accessToken: string
): Promise<DeveloperApplication> {
  return (
    await api.post<DeveloperApplication>(
      `/users/admin/developer-applications/${appId}/review`,
      { approve, note },
      auth(accessToken)
    )
  ).data;
}

export async function getAllUsers(accessToken: string): Promise<UserProfile[]> {
  return (await api.get<UserProfile[]>("/users", auth(accessToken))).data;
}

// ── 설치/라이브러리 ────────────────────────────────────────────────────────
export async function installAsset(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/install`, undefined, auth(accessToken));
}

export async function getInstalledAssets(accessToken: string): Promise<InstalledAsset[]> {
  return (await api.get<InstalledAsset[]>("/assets/me/installed", auth(accessToken))).data;
}

export async function getEntitlements(accessToken: string): Promise<StoreEntitlement[]> {
  return (await api.get<StoreEntitlement[]>("/assets/me/entitlements", auth(accessToken))).data;
}

// ── 위시리스트 ────────────────────────────────────────────────────────────
export async function getWishlist(accessToken: string): Promise<StoreWishlistItem[]> {
  return (await api.get<StoreWishlistItem[]>("/assets/me/wishlist", auth(accessToken))).data;
}

export async function addWishlist(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/wishlist`, undefined, auth(accessToken));
}

export async function removeWishlist(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/wishlist`, auth(accessToken));
}

// ── 장바구니 ──────────────────────────────────────────────────────────────
export async function getCart(accessToken: string): Promise<StoreCartItem[]> {
  return (await api.get<StoreCartItem[]>("/assets/me/cart", auth(accessToken))).data;
}

export async function addCart(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/cart`, undefined, auth(accessToken));
}

export async function removeCart(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/cart`, auth(accessToken));
}

export async function checkoutFreeCart(accessToken: string): Promise<StoreEntitlement[]> {
  return (await api.post<StoreEntitlement[]>("/assets/me/cart/checkout-free", undefined, auth(accessToken))).data;
}

// ── 앱 릴리즈 ─────────────────────────────────────────────────────────────
export async function getAppReleases(): Promise<AppRelease[]> {
  return (await api.get<AppRelease[]>("/app/releases")).data;
}

export async function getLatestAppRelease(
  platform: AppReleasePlatform,
  channel: AppReleaseChannel = "stable"
): Promise<AppRelease> {
  return (await api.get<AppRelease>("/app/releases/latest", { params: { platform, channel } })).data;
}

// ── 헬퍼 ──────────────────────────────────────────────────────────────────
function auth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}