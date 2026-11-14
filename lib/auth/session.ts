/**
 * A tiny signed session: the cookie holds "<expiry ms>.<HMAC-SHA256 hex>".
 * Web Crypto only, so it runs in proxy.ts, route handlers and server actions alike.
 */
export const SESSION_COOKIE = "dp_session";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function createToken(secret: string, now = Date.now()): Promise<{ token: string; expires: Date }> {
  const exp = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return { token: `${exp}.${await hmacHex(secret, `dream-planner:${exp}`)}`, expires: new Date(exp) };
}

export async function verifyToken(token: string | undefined, secret: string | undefined, now = Date.now()): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= now) return false;
  return safeEqual(sig, await hmacHex(secret, `dream-planner:${expStr}`));
}

/** Both settings must be present for login to work; the app fails closed otherwise. */
export function authConfig(): { passcode: string; secret: string } | null {
  const passcode = process.env.APP_PASSCODE ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (!passcode || secret.length < 32) return null;
  return { passcode, secret };
}

/** Only allow redirects back to our own pages. */
export function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
}
