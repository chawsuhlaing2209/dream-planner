import { describe, expect, it } from "vitest";
import { createToken, safeEqual, safeNext, verifyToken } from "./session";

const secret = "x".repeat(40);

describe("session token", () => {
  it("accepts a fresh token signed with the same secret", async () => {
    const { token } = await createToken(secret, 1_000);
    expect(await verifyToken(token, secret, 2_000)).toBe(true);
  });
  it("rejects a wrong secret, a tampered expiry, an expired token and junk", async () => {
    const { token, expires } = await createToken(secret, 1_000);
    expect(await verifyToken(token, "y".repeat(40), 2_000)).toBe(false);
    const [exp, sig] = token.split(".");
    expect(await verifyToken(`${Number(exp) + 1}.${sig}`, secret, 2_000)).toBe(false);
    expect(await verifyToken(token, secret, expires.getTime() + 1)).toBe(false);
    expect(await verifyToken("nonsense", secret)).toBe(false);
    expect(await verifyToken(undefined, secret)).toBe(false);
    expect(await verifyToken(token, undefined)).toBe(false);
  });
  it("compares strings safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
  it("only redirects to our own pages", () => {
    expect(safeNext("/expenses?m=2026-11")).toBe("/expenses?m=2026-11");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("/login")).toBe("/");
    expect(safeNext(undefined)).toBe("/");
  });
});
