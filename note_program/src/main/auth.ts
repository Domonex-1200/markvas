export const API_BASE_URL = "https://d36v39m4b0nmuu.cloudfront.net/api";

export interface StoreAuthState {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nickname: string | null;
    role: string;
    profilePictureUrl: string | null;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nickname: string | null;
  role: string;
  profilePictureUrl: string | null;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AuthTokens;
}

export async function loginWithCredentials(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message ?? `로그인 실패 (${response.status})`);
  }

  return response.json() as Promise<LoginResult>;
}

export async function fetchMe(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
  return response.json() as Promise<AuthUser>;
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) throw new Error("토큰 갱신 실패. 다시 로그인해주세요.");
  return response.json() as Promise<AuthTokens>;
}

export function toStoreAuthState(result: LoginResult): StoreAuthState {
  return {
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
    user: {
      id: result.user.id,
      email: result.user.email,
      nickname: result.user.nickname,
      role: result.user.role,
      profilePictureUrl: result.user.profilePictureUrl
    }
  };
}
