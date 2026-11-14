import { describe, expect, it } from "vitest";
import { decimal, foreign, kyat, kyatM, plain } from "./format";

describe("format", () => {
  it("formats kyat with separators and rounds at the edge", () => {
    expect(kyat(1234567.4)).toBe("K 1,234,567");
    expect(kyat(-288000)).toBe("-K 288,000");
  });
  it("formats millions for the board", () => {
    expect(kyatM(63434175)).toBe("K 63.4M");
    expect(kyatM(-288000)).toBe("−K 0.3M");
  });
  it("formats plain, decimal and foreign numbers", () => {
    expect(plain(950)).toBe("950");
    expect(decimal(1651.5)).toBe("1,651.5");
    expect(foreign("SGD", 1923.54)).toBe("S$1,923.54");
    expect(foreign("THB", 74952)).toBe("฿74,952");
  });
});
