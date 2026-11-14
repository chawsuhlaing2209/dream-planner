import { expect, it } from "vitest";
import { niceMax } from "./chart";

it("rounds up to a nice ceiling", () => {
  expect(niceMax(185_570_056 * 1.02)).toBe(200_000_000);
  expect(niceMax(38.4e6)).toBe(50e6);
  expect(niceMax(0)).toBe(1);
});
