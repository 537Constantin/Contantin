/**
 * Google OAuth2 helpers for connecting a Gmail / Google Workspace mailbox
 * without an app password. We request the full-mail scope so the same IMAP
 * pipeline (ImapFlow with XOAUTH2) works — only the auth differs.
 *
 * Requires GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET (set by the
 * app owner in the hosting env). The client secret never reaches the browser.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
// Full IMAP/SMTP access + identity so we know which address was connected.
const GOOGLE_SCOPE = "openid email https://mail.google.com/";

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
}

export function googleCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/inbox/oauth/google/callback`;
}

/** Consent screen URL. `state` guards against CSRF, verified in the callback. */
export function googleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_SCOPE,
    access_type: "offline", // ask for a refresh token
    prompt: "consent", // force refresh token even on re-consent
    include_granted_scopes: "true",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Decode the email claim out of an id_token JWT (no verification needed — it
 * came straight from the provider's token endpoint over TLS). Microsoft work
 * accounts carry the address in preferred_username / upn rather than email. */
function emailFromIdToken(idToken: string): string {
  try {
    const payload = idToken.split(".")[1];
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const c = JSON.parse(json) as { email?: string; preferred_username?: string; upn?: string };
    return (c.email || c.preferred_username || c.upn || "").trim();
  } catch {
    return "";
  }
}

export interface GoogleTokens {
  refreshToken: string;
  accessToken: string;
  email: string;
}

/** Exchange the one-time auth code for tokens + the connected email address. */
export async function googleExchangeCode(code: string, redirectUri: string): Promise<GoogleTokens | null> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const j = (await res.json().catch(() => null)) as
    | { access_token?: string; refresh_token?: string; id_token?: string }
    | null;
  if (!j?.access_token || !j.refresh_token) return null;

  return {
    refreshToken: j.refresh_token,
    accessToken: j.access_token,
    email: j.id_token ? emailFromIdToken(j.id_token) : "",
  };
}

/** Trade a stored refresh token for a fresh access token (valid ~1h). */
export async function googleRefreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const j = (await res.json().catch(() => null)) as { access_token?: string } | null;
  return j?.access_token ?? null;
}

// ── Microsoft (Outlook / Microsoft 365) ────────────────────────────────────
// The "common" tenant lets both personal (outlook.com/hotmail) and work/school
// (Microsoft 365) accounts sign in. IMAP.AccessAsUser.All + offline_access give
// us IMAP access with a refresh token; ImapFlow connects via XOAUTH2.
const MS_TENANT = process.env.MICROSOFT_OAUTH_TENANT || "common";
const MS_AUTH_URL = `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/authorize`;
const MS_TOKEN_URL = `https://login.microsoftonline.com/${MS_TENANT}/oauth2/v2.0/token`;
const MS_SCOPE = "openid email profile offline_access https://outlook.office.com/IMAP.AccessAsUser.All";
// Refresh must not include openid/offline_access — only the resource scope.
const MS_REFRESH_SCOPE = "https://outlook.office.com/IMAP.AccessAsUser.All";

export function microsoftConfigured(): boolean {
  return Boolean(process.env.MICROSOFT_OAUTH_CLIENT_ID && process.env.MICROSOFT_OAUTH_CLIENT_SECRET);
}

export function microsoftCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/inbox/oauth/microsoft/callback`;
}

export function microsoftAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: MS_SCOPE,
    response_mode: "query",
    prompt: "select_account",
    state,
  });
  return `${MS_AUTH_URL}?${params.toString()}`;
}

export async function microsoftExchangeCode(code: string, redirectUri: string): Promise<GoogleTokens | null> {
  const res = await fetch(MS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      scope: MS_SCOPE,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const j = (await res.json().catch(() => null)) as
    | { access_token?: string; refresh_token?: string; id_token?: string }
    | null;
  if (!j?.access_token || !j.refresh_token) return null;

  return {
    refreshToken: j.refresh_token,
    accessToken: j.access_token,
    email: j.id_token ? emailFromIdToken(j.id_token) : "",
  };
}

export async function microsoftRefreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch(MS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.MICROSOFT_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      scope: MS_REFRESH_SCOPE,
    }),
  }).catch(() => null);

  if (!res || !res.ok) return null;
  const j = (await res.json().catch(() => null)) as { access_token?: string } | null;
  return j?.access_token ?? null;
}
