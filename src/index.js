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
 * faster interval than `wait`.
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
 * @property {number} horizontalViewportSegments - The number of horizontal viewport segments
 * @property {number} verticalViewportSegments - The number of vertical viewport segments
 * @property {object} segments - Returns an array of screen and fold segments, in order, each segment is an object containing width, height, top and left properties.
 * @property {EventHandler} onchange - An event handler for the "change" event.
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

  get horizontalViewportSegments() { return +sessionStorage.getItem(`${ns}-horizontal-viewport-segments`) || 1 }
  set horizontalViewportSegments(v) {
    if (isNaN(v)) {
      throw new TypeError(v);
    }
    sessionStorage.setItem(`${ns}-horizontal-viewport-segments`, v);
    invalidate();
  }

  get verticalViewportSegments() { return +sessionStorage.getItem(`${ns}-vertical-viewport-segments`) || 1 }
  set verticalViewportSegments(v) {
    if (isNaN(v)) {
      throw new TypeError(v);
    }
    sessionStorage.setItem(`${ns}-vertical-viewport-segments`, v);
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
    if (this.verticalViewportSegments === 1 && this.horizontalViewportSegments === 1) {
      return [
        { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight },
      ];
    }
    let segments = [];
    // The fold is defined as a segment here because it's used in the css spanning polyfill.
    if (this.verticalViewportSegments > 1) {
      let numberOfFolds = this.verticalViewportSegments - 1;
      const availableHeight = window.innerHeight - this.browserShellSize;
      let topOffset = 0;
      const width = window.innerWidth;
      const height = availableHeight / this.verticalViewportSegments - this.foldSize *
        numberOfFolds / this.verticalViewportSegments;
      for (let i = 0; i < this.verticalViewportSegments + numberOfFolds; ++i) {
        if (i % 2 === 0)
          segments[i] = { top: topOffset, left: 0, bottom: topOffset + height, right: width, width: width, height: height };
        else
          segments[i] = { top: topOffset, left: 0, right: width, bottom: topOffet + this.foldSize, width: width, height: this.foldSize };
        topOffset += segments[i].height;
      }
    }

    if (this.horizontalViewportSegments > 1) {
      let numberOfFolds = this.horizontalViewportSegments - 1;
      const width = window.innerWidth / this.horizontalViewportSegments - this.foldSize *
        numberOfFolds / this.horizontalViewportSegments;
      const height = window.innerHeight;
      let leftOffset = 0;

      for (let i = 0; i < this.horizontalViewportSegments + numberOfFolds; ++i) {
        if (i % 2 === 0)
          segments[i] = { top: 0, left: leftOffset, right: leftOffset + width, bottom: height, width: width, height: height };
        else
          segments[i] = { top: 0, left: leftOffset, right: leftOffset + this.foldSize, bottom: height, width: this.foldSize, height: height };
        leftOffset += segments[i].width;
      }
    }

    return segments;
  }
}

window[ns] = new FoldablesFeature;

/**
 * @function
 * @name window.visualViewport.segments
 * @description Returns an array of screen segments, each segment is an object containing
 * width, height, top and left properties (AKA segment's bounding rects).
 */
if (window.visualViewport.segments === undefined) {
  window.visualViewport.segments = function() {
    const segments = window[ns].getSegments();
    if (segments.length === 1)
      return segments;
    else {
      // Only returns the segments, not the folds.
      return segments.filter((x, i) => i % 2 === 0);
    }
  };
}
