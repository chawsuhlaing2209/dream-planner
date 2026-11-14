import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("adds a BOM, quotes commas and quotes, keeps Burmese", () => {
    const out = toCsv(["Item", "Amount"], [["ညိုတေး", 200000], ['Flight "ygn", sg', -288000]]);
    expect(out.startsWith("﻿")).toBe(true);
    expect(out).toContain("ညိုတေး,200000");
    expect(out).toContain('"Flight ""ygn"", sg",-288000');
  });
  it("neutralises text that looks like a formula, but not negative numbers", () => {
    expect(toCsv(["a"], [["=SUM(A1)"]])).toContain("'=SUM(A1)");
    expect(toCsv(["a"], [[-5]])).toContain("\r\n-5\r\n");
  });
  it("writes booleans and empties plainly", () => {
    expect(toCsv(["a", "b", "c"], [[true, null, 1.005]])).toContain("yes,,1");
  });
});
