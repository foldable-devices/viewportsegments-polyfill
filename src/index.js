const ns = "__foldables__";

let needsDispatch = false;
async function invalidate() {
  if (!needsDispatch) {
    needsDispatch = true;
    needsDispatch = await Promise.resolve(false);
    window[ns].dispatchEvent(new Event('change'));
  }
}

/**
 * Returns a function that won't call `fn` if it was invoked at a
 * faster interval than `wait`
 *
 * @param {Function} fn
 * @param {Number} wait - milliseconds
 */
export function debounce(fn, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, arguments), wait);
  };
}

/**
 *
 * @typedef FoldablesFeature
 * @type {object}
 * @property {number} foldSize - The width of the visible fold (hinge) between the two screens, in CSS pixels.
 * @property {number} browserShellSize - The height of the user agent (browser) top chrome, in CSS pixels.
 * @property {string} spanning - The spanning mode: "single-fold-horizontal", "single-fold-vertical" or "none".
 * @property {EventHandler} onchange
 */
export class FoldablesFeature {
  constructor() {
    if (window[ns] !== undefined) {
      return window[ns];
    }

    const eventTarget = document.createDocumentFragment();
    this.addEventListener = eventTarget['addEventListener'].bind(eventTarget);
    this.removeEventListener = eventTarget['removeEventListener'].bind(eventTarget);
    this.dispatchEvent = event => {
      if (event.type !== "change") {
        return;
      }
      const methodName = `on${event.type}`;
      if (typeof this[methodName] == 'function') {
        this[methodName](event);
      }
      return eventTarget.dispatchEvent(event);
    }

    // Web-based emulator runs this polyfill in an iframe, we need to
    // communicate emulator state changes to the site.
    // Should only be registered once (in CSS or JS polyfill, not both).
    window.addEventListener("message", ev => {
      if (ev.data.action === "update") {
        Object.assign(this, ev.data.value);
      }
    });

    window.addEventListener("resize", () => debounce(invalidate(), 200));
  }

  get spanning() { return sessionStorage.getItem(`${ns}-spanning`) || "none" }
  set spanning(v) {
    if (!["none", "single-fold-horizontal", "single-fold-vertical"].includes(v)) {
      throw new TypeError(v);
    }
    sessionStorage.setItem(`${ns}-spanning`, v);
    invalidate();
  }

  get foldSize() { return +sessionStorage.getItem(`${ns}-fold-size`) || 0 }
  set foldSize(v) {
    if (!(Number(v) >= 0)) {
      throw new TypeError(v);
    }
    sessionStorage.setItem(`${ns}-fold-size`, v);
    invalidate();
  }

  get browserShellSize() { return +sessionStorage.getItem(`${ns}-browser-shell-size`) || 0 }
  set browserShellSize(v) {
    if (!(Number(v) >= 0)) {
      throw new TypeError(v);
    }
    sessionStorage.setItem(`${ns}-browser-shell-size`, v);
    invalidate();
  }

  getSegments() {
    if (this.spanning === "none") {
      return [
        { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
      ];
    }

    if (this.spanning === "single-fold-horizontal") {
      const screenCenter = (window.innerHeight - this.browserShellSize) / 2;
      const width = window.innerWidth;
      return [
        { top: 0, left: 0, width, height: screenCenter - this.foldSize / 2 },
        { top: screenCenter - this.foldSize / 2, height: this.foldSize, left: 0, width },
        { top: screenCenter + this.foldSize / 2, left: 0, width, height: window.innerHeight }
      ];
    }

    if (this.spanning === "single-fold-vertical") {
      const width = window.innerWidth / 2 - this.foldSize / 2;
      const height = window.innerHeight;
      return [
        { top: 0, left: 0, width, height},
        { top: 0, height, left: width, width: this.foldSize },
        { top: 0, left: window.innerWidth / 2 + this.foldSize / 2, width, height }
      ];
    }
  }
}

window[ns] = new FoldablesFeature;
window.getWindowSegments = function() {
  const segments = window[ns].getSegments();
  return [segments[0], segments[2]];
};