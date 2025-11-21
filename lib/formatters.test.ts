import {
  formatNumber,
  formatPercent,
  formatRatio,
  formatDuration,
  formatMinutes,
  metersToKilometers,
  safeDivide,
} from "./formatters";

describe("formatters", () => {
  describe("formatNumber", () => {
    it("returns dash for non-finite values", () => {
      expect(formatNumber(Infinity)).toBe("-");
      expect(formatNumber(NaN)).toBe("-");
    });

    it("formats numbers with thousands separator and rounding", () => {
      expect(formatNumber(1234567.89)).toBe("1,234,568"); // default max digits = 0
      expect(formatNumber(1234.56, 1)).toBe("1,234.6");
      expect(formatNumber(-1234.56, 1)).toBe("-1,234.6");
    });
  });

  describe("formatPercent", () => {
    it("formats percentages with digits and returns 0% for non-finite values", () => {
      expect(formatPercent(12.345)).toBe("12.3%");
      expect(formatPercent(Infinity)).toBe("0%");
      expect(formatPercent(NaN)).toBe("0%");
    });
  });

  describe("formatRatio", () => {
    it("converts ratio to percent string", () => {
      expect(formatRatio(0.25)).toBe("25.0%");
      expect(formatRatio(NaN)).toBe("0%");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds to MM:SS and pads zeros", () => {
      expect(formatDuration(65.9)).toBe("01:05");
      expect(formatDuration(0)).toBe("00:00");
      expect(formatDuration(9)).toBe("00:09");
    });

    it("returns 00:00 for invalid inputs", () => {
      expect(formatDuration(Infinity)).toBe("00:00");
      expect(formatDuration(NaN)).toBe("00:00");
      expect(formatDuration(-10)).toBe("00:00");
    });
  });

  describe("formatMinutes", () => {
    it("formats minutes with unit and digits", () => {
      expect(formatMinutes(12.345)).toBe("12.3 分");
      expect(formatMinutes(Infinity)).toBe("0 分");
    });
  });

  describe("metersToKilometers", () => {
    it("converts meters to kilometers with unit", () => {
      expect(metersToKilometers(1000)).toBe("1.0 km");
      expect(metersToKilometers(1500, 2)).toBe("1.50 km");
      expect(metersToKilometers(Infinity)).toBe("0 km");
    });
  });

  describe("safeDivide", () => {
    it("performs safe division and handles invalid cases", () => {
      expect(safeDivide(10, 2)).toBe(5);
      expect(safeDivide(1, 3)).toBeCloseTo(1 / 3);
      expect(safeDivide(1, 0)).toBe(0);
      expect(safeDivide(Infinity, 2)).toBe(0);
      expect(safeDivide(2, Infinity)).toBe(0);
    });
  });
});
