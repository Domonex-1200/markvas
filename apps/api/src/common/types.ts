export type UserRole = "USER" | "DEVELOPER" | "ADMIN";

export type AssetType = "THEME" | "PLUGIN" | "TEMPLATE";

export type PluginPermission = "note:read" | "note:write" | "workspace:read";

export interface PluginCommand {
  id: string;
  title: string;
  description?: string;
}

export interface PluginManifest {
  id: string;
  title: string;
  version: string;
  description?: string;
  permissions: PluginPermission[];
  commands: PluginCommand[];
  entryFile: string;
  code?: string;
}

export interface DesignTokens {
  colors?: Record<string, string>;
  typography?: Record<string, string | number>;
  editorCss?: string;
  exportCss?: string;
}

export interface AssetMetadata {
  version: string;
  description?: string;
  summary?: string;
  changelog?: string;
  media?: {
    coverImageUrl?: string;
    screenshots?: string[];
  };
  marketing?: {
    websiteUrl?: string;
    repositoryUrl?: string;
    documentationUrl?: string;
  };
  tokens?: DesignTokens;
  template?: {
    id: string;
    title: string;
    description?: string;
    content: string;
  };
  plugin?: PluginManifest;
  entryFile?: string;
  checksum?: string;
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

export interface StoreCartItem {
  id: string;
  asset: StoreAsset;
  addedAt: string;
}

export interface StoreWishlistItem {
  id: string;
  asset: StoreAsset;
  addedAt: string;
}

export interface StoreEntitlement {
  id: string;
  asset: StoreAsset;
  source: "FREE" | "PURCHASE" | "ADMIN_GRANT";
  grantedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
}

export type AppReleasePlatform = "windows" | "macos" | "linux";

export type AppReleaseChannel = "stable" | "beta";

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
