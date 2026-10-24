import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/index.js", import.meta.url), "utf8");

async function loadWith(fakeWindow) {
  globalThis.window = fakeWindow;
  globalThis.document = { createDocumentFragment: () => new EventTarget() };
  globalThis.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
  };
  return import(`data:text/javascript,${encodeURIComponent(source)}#${Math.random()}`);
}

test("unsupported Visual Viewport does not throw during import", async () => {
  const events = new EventTarget();
  await loadWith({
    innerWidth: 400, innerHeight: 700,
    addEventListener: events.addEventListener.bind(events),
  });
});

test("resize uses a delayed callback rather than invalidating at registration", async () => {
  const events = new EventTarget();
  const viewport = {};
  const fakeWindow = {
    innerWidth: 800, innerHeight: 600, visualViewport: viewport,
    addEventListener: events.addEventListener.bind(events),
  };
  await loadWith(fakeWindow);
  const feature = fakeWindow.__foldables__;
  assert.ok(feature);
  let updates = 0;
  const previousUpdate = feature.updateSegments.bind(feature);
  feature.updateSegments = () => { updates += 1; previousUpdate(); };
  events.dispatchEvent(new Event("resize"));
  events.dispatchEvent(new Event("resize"));
  assert.equal(updates, 0, "updates should be debounced");
  await new Promise(resolve => setTimeout(resolve, 250));
  assert.equal(updates, 1, "resize burst should cause one update");
});
