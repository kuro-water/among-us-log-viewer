import "@testing-library/jest-dom";

// Some libraries (Highcharts) check window.CSS?.supports; jsdom doesn't provide
// a CSS.supports implementation by default. Provide a simple shim so tests
// don't throw when Highcharts tries to call it.
if (typeof (globalThis as any).CSS === "undefined") {
  (globalThis as any).CSS = { supports: () => false };
}
