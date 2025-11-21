// Shim global CSS.supports for jsdom
if (typeof (globalThis as any).CSS === "undefined") {
  (globalThis as any).CSS = { supports: () => false };
}
