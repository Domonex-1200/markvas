export type UserRole = "USER" | "DEVELOPER" | "ADMIN";
export type AssetType = "THEME" | "PLUGIN" | "TEMPLATE";
export type AppReleasePlatform = "windows" | "macos" | "linux";
export type AppReleaseChannel = "stable" | "beta";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AssetMetadata {
  version: string;
  description?: string;
  summary?: string;
  changelog?: string;
  tokens?: Record<string, unknown>;
  media?: { coverImageUrl?: string; [key: string]: unknown };
  template?: { id: string; title: string; description?: string; content: string };
  plugin?: {
    id: string;
    title: string;
    version: string;
    description?: string;
    entryFile: string;
    commands?: unknown[];
    permissions?: string[];
    code?: string;
    [key: string]: unknown;
  };
  checksum?: string;
  [key: string]: unknown;
}

export interface StoreAsset {
  id: string;
  title: string;
  type: AssetType;
  metadata: AssetMetadata;
  filePath: string;
  authorId: string;
  pricingType?: "FREE" | "PAID";
  priceCents?: number;
  currency?: string;
  status?: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "REJECTED";
  createdAt: string;
}

export interface StoreCartItem     { id: string; asset: StoreAsset; addedAt: string }
export interface StoreWishlistItem { id: string; asset: StoreAsset; addedAt: string }
export interface StoreEntitlement  { id: string; asset: StoreAsset; source: string; grantedAt: string }
export interface InstalledAsset    { asset: StoreAsset; installedAt: string }

export interface AuthTokens  { accessToken: string; refreshToken: string }
export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
  nickname?: string;
  profilePictureUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  nickname?: string;
  phone?: string;
  birthday?: string;
  gender?: Gender;
  profilePictureUrl?: string;
  createdAt: string;
  active: boolean;
  deactivatedAt?: string;
}

export interface DeveloperApplication {
  id: string;
  userId: string;
  userEmail: string;
  userNickname?: string;
  reason: string;
  status: ApplicationStatus;
  reviewNote?: string;
  reviewedBy?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface AppRelease {
  id: string;
  version: string;
  platform: AppReleasePlatform;
  channel: AppReleaseChannel;
  downloadUrl: string;
  checksum: string;
  signature?: string;
  releaseNotes: string;
  publishedAt: string;
}