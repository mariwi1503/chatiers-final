const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");

// Load the domain module with the project's TypeScript compiler, without a test dependency.
const previousLoader = require.extensions[".ts"];
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
};
const { saveProduct, publishProduct, deleteProduct, getNextShareAt, SHARE_COOLDOWN_MS } = require("../src/lib/storefront.ts");
if (previousLoader) require.extensions[".ts"] = previousLoader;
else delete require.extensions[".ts"];

const empty = () => ({ products: [], posts: [], company: null });
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 19, 9);
const draft = { name: "UI Kit", description: "Komponen desain", price: 150000, category: "Produk Digital", status: "available" };

test("saving and editing catalog products never creates a feed post", () => {
  const created = saveProduct(empty(), draft, "product-1");
  assert.equal(created.products.length, 1);
  assert.equal(created.posts.length, 0);
  const edited = saveProduct(created, { ...draft, price: 200000 }, "product-1");
  assert.equal(edited.products.length, 1);
  assert.equal(edited.products[0].price, 200000);
  assert.equal(edited.posts.length, 0);
  assert.equal(created.products[0].price, 150000);
});

test("explicit publication creates one sell post referencing the original product", () => {
  const catalog = saveProduct(empty(), draft, "product-1");
  const published = publishProduct(catalog, "product-1", "  Produk baru saya  ", 123, NOW);
  assert.equal(published.posts.length, 1);
  assert.equal(published.posts[0].id, 123);
  assert.equal(published.posts[0].productId, "product-1");
  assert.equal(published.posts[0].text, "Produk baru saya");
  assert.equal(published.posts[0].category, "sell");
  assert.equal(published.products[0].lastSharedAt, NOW);
  assert.equal(catalog.posts.length, 0);
  assert.equal(catalog.products[0].lastSharedAt, undefined);
});

test("editing a published product preserves its post and stable product reference", () => {
  const published = publishProduct(saveProduct(empty(), draft, "product-1"), "product-1", "", 123, NOW);
  const edited = saveProduct(published, { ...draft, name: "UI Kit Pro", price: 250000, status: "sold" }, "product-1");
  assert.equal(edited.posts.length, 1);
  assert.equal(edited.posts[0].productId, edited.products[0].id);
  assert.equal(edited.products[0].status, "sold");
  assert.equal(edited.products[0].price, 250000);
  assert.deepEqual(edited.posts, published.posts);
  assert.equal(edited.products[0].lastSharedAt, NOW);
});

test("publication rejects missing and sold products, independently of the UI", () => {
  assert.throws(() => publishProduct(empty(), "missing", "", 1, NOW), /tidak ditemukan/);
  const sold = saveProduct(empty(), { ...draft, status: "sold" }, "sold");
  assert.throws(() => publishProduct(sold, "sold", "", 1, NOW), /terjual/);
});

test("invalid product input cannot enter the catalog", () => {
  for (const invalid of [{ price: -1 }, { price: NaN }, { price: 1.5 }, { name: "  " }, { category: " " }, { category: "Kategori Bebas" }, { description: " " }, { image: "javascript:alert(1)" }, { image: "data:text/html;base64,PHNjcmlwdD4=" }, { image: "data:image/svg+xml;base64,PHN2Zz4=" }]) {
    assert.throws(() => saveProduct(empty(), { ...draft, ...invalid }, "invalid"));
  }
  assert.equal(saveProduct(empty(), { ...draft, price: 0 }, "free").products[0].price, 0);
});

test("uploaded photos are stored as image data URLs", () => {
  const image = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  assert.equal(saveProduct(empty(), { ...draft, image }, "photo").products[0].image, image);
});

test("deleting a product also removes the feed post that references it", () => {
  const published = publishProduct(saveProduct(saveProduct(empty(), draft, "a"), draft, "b"), "a", "", 1, NOW);
  const deleted = deleteProduct(published, "a");
  assert.deepEqual(deleted.products.map((item) => item.id), ["b"]);
  assert.equal(deleted.posts.length, 0);
  assert.throws(() => deleteProduct(deleted, "a"), /tidak ditemukan/);
});

test("a product can be shared again, each time as a new post, only 3 days after its previous share", () => {
  const catalog = saveProduct(empty(), draft, "p");
  assert.equal(getNextShareAt(catalog, "p"), null);
  const first = publishProduct(catalog, "p", "Pertama", 1, NOW);
  assert.equal(SHARE_COOLDOWN_MS, 3 * DAY);
  assert.equal(getNextShareAt(first, "p"), NOW + 3 * DAY);
  assert.throws(() => publishProduct(first, "p", "Terlalu cepat", 2, NOW + 3 * DAY - 1), /baru bisa dibagikan lagi/);
  const second = publishProduct(first, "p", "Kedua", 2, NOW + 3 * DAY);
  assert.deepEqual(second.posts.map((post) => post.text), ["Kedua", "Pertama"]);
  // The cooldown restarts from the latest share, not the first one.
  assert.throws(() => publishProduct(second, "p", "Ketiga", 3, NOW + 4 * DAY), /baru bisa dibagikan lagi/);
  assert.equal(publishProduct(second, "p", "Ketiga", 3, NOW + 6 * DAY).posts.length, 3);
});

test("the cooldown survives deleting the shared post from the feed", () => {
  const shared = publishProduct(saveProduct(empty(), draft, "p"), "p", "", 1, NOW);
  const postRemoved = { ...shared, posts: [] };
  assert.throws(() => publishProduct(postRemoved, "p", "", 2, NOW + DAY), /baru bisa dibagikan lagi/);
});

test("shares made before share timestamps existed fall back to the post's creation time", () => {
  const legacy = { ...saveProduct(empty(), draft, "p"), posts: [{ id: NOW, productId: "p" }] };
  assert.equal(getNextShareAt(legacy, "p"), NOW + 3 * DAY);
});
