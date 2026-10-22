const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");

// Load the real component tree, resolving the app's TypeScript imports and aliases.
const root = path.resolve(__dirname, "..");
const cache = new Map();
function loadSource(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const nativeRequire = createRequire(filename);
  const localRequire = (id) => {
    if (id.startsWith("@/") || id.startsWith(".")) {
      const base = id.startsWith("@/") ? path.join(root, "src", id.slice(2)) : path.resolve(path.dirname(filename), id);
      const source = [base, `${base}.ts`, `${base}.tsx`].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
      if (source && /\.tsx?$/.test(source)) return loadSource(source);
    }
    return nativeRequire(id);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  new Function("require", "module", "exports", outputText)(localRequire, module, module.exports);
  return module.exports;
}

const data = loadSource(path.join(root, "src/lib/data.ts"));
const { formatProductPrice } = loadSource(path.join(root, "src/lib/storefront.ts"));
const { StorefrontProvider } = loadSource(path.join(root, "src/components/storefront-provider.tsx"));
const { ChatiersApp } = loadSource(path.join(root, "src/components/chatiers-app.tsx"));
const renderFeed = () => renderToString(React.createElement(StorefrontProvider, null, React.createElement(ChatiersApp)));

test("feed renders service and rental filters with their prices", () => {
  const html = renderFeed();
  assert.match(html, />Jasa<\/button>/);
  assert.match(html, />Rental<\/button>/);
  assert.ok(html.includes("Rp 200.000 / jam"));
  assert.ok(html.includes("Rp 1.500.000 / proyek"));
});

test("a category without a style cannot crash the filters or post badges", () => {
  const category = { id: "future-category", label: "Kategori baru", icon: null };
  const post = { ...data.posts[0], id: 99999, category: category.id };
  data.categories.push(category);
  data.posts.push(post);
  try {
    assert.match(renderFeed(), />Kategori baru<\/button>/);
  } finally {
    data.categories.pop();
    data.posts.pop();
  }
});

test("feed markup stays identical when the browser omits the currency space", () => {
  const serverHtml = renderFeed();
  const original = Intl.NumberFormat;
  Intl.NumberFormat = function (locale, options) {
    const formatter = new original(locale, options);
    if (options?.style === "currency") {
      return { format: (value) => formatter.format(value).replace(/^Rp\s*/, "Rp") };
    }
    return formatter;
  };
  try {
    assert.equal(renderFeed(), serverHtml);
  } finally {
    Intl.NumberFormat = original;
  }
});

test("rupiah output uses consistent spacing, grouping, and whole-number rounding", () => {
  for (const [value, expected] of [[0, "Rp 0"], [200000, "Rp 200.000"], [1500000, "Rp 1.500.000"], [1234.5, "Rp 1.235"]]) {
    assert.equal(formatProductPrice(value), expected);
  }
});
