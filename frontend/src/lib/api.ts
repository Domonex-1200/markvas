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

// ── 토큰 자동 갱신 인터셉터 ───────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // refresh 요청 자체가 실패하거나 이미 재시도한 요청이면 로그아웃
    if (error.response?.status !== 401 || original._retry || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const refreshToken = window.localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // 이미 갱신 중이면 새 토큰이 발급될 때까지 대기
      return new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      }).then((newToken) => {
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );
      const { accessToken, refreshToken: newRefresh } = res.data;
      window.localStorage.setItem("accessToken", accessToken);
      window.localStorage.setItem("refreshToken", newRefresh);

      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      original.headers["Authorization"] = `Bearer ${accessToken}`;

      refreshQueue.forEach((cb) => cb(accessToken));
      refreshQueue = [];

      return api(original);
    } catch {
      logout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

function logout(): void {
  ["accessToken", "refreshToken", "role", "userEmail", "nickname"].forEach((k) =>
    window.localStorage.removeItem(k)
  );
  window.location.href = "/login";
}

// ── 에셋 ──────────────────────────────────────────────────────────────────
export async function getAssets(params?: { q?: string; type?: string; tag?: string }): Promise<StoreAsset[]> {
  return (await api.get<StoreAsset[]>("/assets", { params })).data;
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

export async function rejectAsset(assetId: string, accessToken: string, note?: string): Promise<StoreAsset> {
  return (await api.post<StoreAsset>(`/assets/${assetId}/reject`, note ? { note } : undefined, auth(accessToken))).data;
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

export async function changeUserRole(userId: string, role: string, accessToken: string): Promise<UserProfile> {
  return (await api.put<UserProfile>(`/users/${userId}/role`, { role }, auth(accessToken))).data;
}

export async function setUserActive(userId: string, active: boolean, accessToken: string): Promise<UserProfile> {
  return (await api.put<UserProfile>(`/users/${userId}/active`, { active }, auth(accessToken))).data;
}

export interface AdminStats {
  totalUsers: number;
  developers: number;
  admins: number;
  totalAssets: number;
  publishedAssets: number;
  inReviewAssets: number;
  pendingApplications: number;
}

export async function getAdminStats(accessToken: string): Promise<AdminStats> {
  return (await api.get<AdminStats>("/users/admin/stats", auth(accessToken))).data;
}

// ── 설치/라이브러리 ────────────────────────────────────────────────────────
export async function purchaseAsset(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/purchase`, undefined, auth(accessToken));
}

export async function installAsset(assetId: string, accessToken: string): Promise<void> {
  await api.post(`/assets/${assetId}/install`, undefined, auth(accessToken));
}

export async function uninstallAsset(assetId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/install`, auth(accessToken));
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

export interface CreateReleasePayload {
  version: string;
  platform: AppReleasePlatform;
  channel: AppReleaseChannel;
  downloadUrl: string;
  checksum: string;
  signature?: string;
  releaseNotes: string;
}

export async function createAppRelease(payload: CreateReleasePayload, accessToken: string): Promise<AppRelease> {
  return (await api.post<AppRelease>("/app/releases", payload, auth(accessToken))).data;
}

// ── 파일 업로드 ───────────────────────────────────────────────────────────────
export async function presignUpload(
  folder: string,
  filename: string,
  contentType: string,
  accessToken: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  return (
    await api.post("/upload/presign", { folder, filename, contentType }, auth(accessToken))
  ).data;
}

export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}

// ── 리뷰 ─────────────────────────────────────────────────────────────────
export async function getAssetReviews(assetId: string): Promise<import("../types").AssetReview[]> {
  return (await api.get(`/assets/${assetId}/reviews`)).data;
}

export async function getReviewSummary(assetId: string): Promise<import("../types").RatingSummary> {
  return (await api.get(`/assets/${assetId}/reviews/summary`)).data;
}

export async function createReview(
  assetId: string,
  payload: { rating: number; body?: string },
  accessToken: string
): Promise<import("../types").AssetReview> {
  return (await api.post(`/assets/${assetId}/reviews`, payload, auth(accessToken))).data;
}

export async function deleteReview(assetId: string, reviewId: string, accessToken: string): Promise<void> {
  await api.delete(`/assets/${assetId}/reviews/${reviewId}`, auth(accessToken));
}


// ── 헬퍼 ──────────────────────────────────────────────────────────────────
function auth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}