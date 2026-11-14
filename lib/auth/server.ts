import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, authConfig, verifyToken } from "./session";

/** True when the request carries a valid session cookie. A second check behind proxy.ts. */
export async function hasSession(): Promise<boolean> {
  const cfg = authConfig();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken(token, cfg?.secret);
}
