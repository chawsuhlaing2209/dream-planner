import { describe, expect, it } from "vitest";
import { kyat, kyatM, plain } from "./format";

describe("format", () => {
  it("formats kyat with separators and rounds at the edge", () => {
    expect(kyat(1234567.4)).toBe("K 1,234,567");
    expect(kyat(-288000)).toBe("-K 288,000");
  });
  it("formats millions for the board", () => {
    expect(kyatM(63434175)).toBe("K 63.4M");
  });
  it("formats plain numbers", () => {
    expect(plain(950)).toBe("950");
  });
});
