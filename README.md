Window Segments Enumeration API polyfill
===

This is a polyfill for the [proposed](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/master/Foldables/explainer.md) JavaScript screen segments enumeration API for foldable and dual-screen devices.

Web developers targeting foldable devices want to be able to effectively lay out the content in a window that spans multiple displays. In some cases such as Canvas context or very unpredictable layouts, developers will need a JavaScript APIs to learn about available screens, their segments and natural boundaries.

### The 'getWindowSegments' Window Method

The `getWindowSegments` window method will return an array of screen segments, each segment is an object containing `width`, `height`, `top` and `left` properties (aka segment's bounding rects)

![Figure showing a foldable devices with 2 screens](https://raw.githubusercontent.com/foldable-devices/windowsegments-polyfill/master/images/screens.png)

#### Example Usage

```js
const screenSegments = window.getWindowSegments();

console.log(screenSegments.length) // 2 in the example above

```

How to use the polyfill
===

This polyfill is packaged as a JavaScript module. It is available on NPM over [here](https://www.npmjs.com/package/window-segments-polyfill).

To install the polyfill just run:

```bash
npm install --save window-segments-polyfill
```

Then you can include it in your project:

```html
<script type="module" src="/path/to/modules/window-segments-polyfill.js"></script>
```

or in your JavaScript source file

```js
import "/path/to/modules/window-segments-polyfill/window-segments-polyfill.js";
```

That's it. See the `demo/basic` directory for examples.

In order to change the display configuration, you can use the polyfill together with an emulator or you can change the settings manually. The settings are stored across sessions.

#### Manually changing the display configuration

You can update values such as `spanning`, `foldSize` and `browserShellSize` by importing the `FoldablesFeature` object. You can also subscribe to the 'change' event
to be notified whenever the `'spanning'` media query feature or the environment variables change. That can happen due to window resizes or because the configuration values were changed programmatically.

```js
  import { FoldablesFeature } from 'windowsegments-polyfill/windowsegments-polyfill.js';

  const foldablesFeat = new FoldablesFeature;

  // Add an event listener.
  foldablesFeat.onchange = () => console.log("change");

    // Add as many event listeners as you want.
  foldablesFeat.addEventListener('change', () => console.log("change"));

  // Change a single value; results in one update (one 'change' event firing).
  foldablesFeat.foldSize = 20;

  // Change multiple values by assignment; results in one update.
  Object.assign(foldablesFeat, { foldSize: 50, spanning: "none"});

  // Change multiple values in one scope; results in one update
  (function() { foldablesFeat.foldSize = 100; foldablesFeat = "single-fold-horizontal" })();
```

Documentation
===
Located [here](https://foldable-devices.github.io/windowsegments-polyfill/global.html).

Test suite
===

There are unfortunately no [web-platform-tests](https://github.com/w3c/web-platform-tests/) available yet.

Known issues
===

Check GitHub [here](https://github.com/foldable-devices/windowsegments-polyfill/issues).

Learn more
===

- [Explainer](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/master/Foldables/explainer.md) - a document explaining how this feature was designed and how it fits together with other APIs.
- [CSS Spanning Media Feature Polyfill](https://github.com/foldable-devices/spanning-css-polyfill)