import { describe, expect, it } from "vitest";
import { currentPeriod, dayLong, monthLong, nextPeriod, todayISO } from "./time";

describe("time", () => {
  it("uses Asia/Yangon (UTC+6:30)", () => {
    // 18:00 UTC on 31 Oct is already 1 Nov in Yangon
    expect(todayISO(new Date("2026-10-31T18:00:00Z"))).toBe("2026-11-01");
    expect(currentPeriod(new Date("2026-10-31T17:00:00Z"))).toBe("2026-10");
  });
  it("formats months and days", () => {
    expect(monthLong("2028-07")).toBe("Jul 2028");
    expect(dayLong("2026-11-14")).toBe("14 Nov 2026");
  });
  it("rolls over the year", () => {
    expect(nextPeriod("2026-12")).toBe("2027-01");
  });
});
