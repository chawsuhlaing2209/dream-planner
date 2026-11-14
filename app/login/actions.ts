"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, authConfig, createToken, safeEqual, safeNext } from "@/lib/auth/session";

export type LoginState = { error: string | null };

// Slow down guessing: at most 8 wrong tries per 15 minutes per address (kept in memory).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRIES = 8;
const tries = new Map<string, { count: number; since: number }>();

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = authConfig();
  if (!cfg) return { error: "Login is not set up yet. Add APP_PASSCODE and SESSION_SECRET to .env.local, then restart." };

  const h = await headers();
  const who = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const rec = tries.get(who);
  if (rec && now - rec.since < WINDOW_MS && rec.count >= MAX_TRIES) {
    return { error: "Too many wrong tries. Wait 15 minutes, then try again." };
  }

  const passcode = String(form.get("passcode") ?? "");
  if (!safeEqual(passcode, cfg.passcode)) {
    const fresh = !rec || now - rec.since >= WINDOW_MS;
    tries.set(who, { count: fresh ? 1 : rec.count + 1, since: fresh ? now : rec.since });
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That passcode is not right. Try again." };
  }
  tries.delete(who);

  const { token, expires } = await createToken(cfg.secret);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
  redirect(safeNext(form.get("next")));
}

export async function logout(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
