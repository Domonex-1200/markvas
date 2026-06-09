export type TreeNodeKind = "workspace" | "folder" | "markdown";

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  kind: TreeNodeKind;
  children?: FileTreeNode[];
}

export interface MarkdownDocument {
  path: string;
  content: string;
  updatedAt: string;
}

export interface TrashEntry {
  id: string;
  name: string;
  originalPath: string;
  trashedPath: string;
  deletedAt: string;
  kind: "folder" | "markdown" | "file";
}

export interface NoteTemplate {
  id: string;
  title: string;
  description?: string;
  content: string;
  source: "workspace" | "asset";
  readonly?: boolean;
}

export interface NoteTemplateInput {
  id: string;
  title: string;
  description?: string;
  content: string;
}

export interface NoteFrontmatter {
  title?: string;
  aliases?: string[];
  tags?: string[];
  template?: string;
  [key: string]: string | string[] | undefined;
}

export interface NoteLink {
  label: string;
  target: string;
  kind: "wikilink" | "markdown";
}

export interface NoteAnalysis {
  title: string;
  frontmatter: NoteFrontmatter;
  tags: string[];
  links: NoteLink[];
  wordCount: number;
  characterCount: number;
}

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

export interface InstalledPlugin {
  id: string;
  title: string;
  version: string;
  description?: string;
  permissions: PluginPermission[];
  commands: PluginCommand[];
}

export interface PluginRunInput {
  pluginId: string;
  commandId: string;
  document: MarkdownDocument | null;
  workspacePath: string | null;
}

export interface PluginRunResult {
  output: unknown;
  logs: string[];
  /** 구조화된 액션 — 플러그인이 반환한 객체에서 자동 감지 */
  action?: PluginAction | undefined;
}

export type PluginAction =
  | { type: "notice"; message: string }
  | { type: "insert"; content: string }          // 커서 위치에 삽입
  | { type: "replace"; content: string }          // 노트 전체 교체
  | { type: "append"; content: string }           // 노트 끝에 추가
  | { type: "open-url"; url: string };            // 외부 URL 열기

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface InstalledAsset {
  asset: StoreAsset;
  installedAt: string;
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
