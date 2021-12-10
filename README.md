Visual Viewport Segments API polyfill
===

This is a polyfill for the [proposed](https://wicg.github.io/visual-viewport/#the-visualviewport-interface) JavaScript visual viewport segments for foldable and dual-screen devices.

Web developers targeting foldable devices want to be able to effectively lay out the content in a window that spans multiple displays. In some cases such as Canvas context or very unpredictable layouts, developers will need a JavaScript APIs to learn about available screens, their segments and natural boundaries.

This polyfill is only useful for the desktop or for devices not supporting the API. If you run it on the Surface Duo the polyfill will not do anything.

### The 'segments' on visualViewport object

The `segments` method will return an array of screen segments, each segment is an object containing `width`, `height`, `top` ,`left`, `right` and `bottom` properties (aka segment's bounding rects)

![Figure showing a foldable devices with 2 screens](https://raw.githubusercontent.com/foldable-devices/viewportsegments-polyfill/master/images/screens.png)

#### Example Usage

```js
const segments = window.visualViewport.segments();

console.log(screenSegments.length) // 2 in the example above

```

How to use the polyfill
===

This polyfill is packaged as a JavaScript module. It is available on NPM over [here](https://www.npmjs.com/package/viewportsegments-polyfill).

To install the polyfill just run:

```bash
npm install --save viewportsegments-polyfill
```

Then you can include it in your project:

```html
<script type="module" src="/path/to/modules/viewportsegments-polyfill.js"></script>
```

or in your JavaScript source file

```js
import "/path/to/modules/viewportsegments-polyfill/viewportsegments-polyfill.js";
```

That's it. See the `demo/basic` directory for examples.

In order to change the display configuration, you can use the polyfill together with an emulator or you can change the settings manually. The settings are stored across sessions.

#### Manually changing the display configuration

You can update values such as `screenSpanning`, `foldSize` and `browserShellSize` by importing the `FoldablesFeature` object. You can also subscribe to the 'change' event to be notified whenever the environment variables change. That can happen due to window resizes or because the configuration values were changed programmatically.

```js
  import { FoldablesFeature } from '/path/to/modules/spanning-css-polyfill/spanning-css-polyfill.js';

  const foldablesFeat = new FoldablesFeature;

  // Add an event listener.
  foldablesFeat.onchange = () => console.log("change");

    // Add as many event listeners as you want.
  foldablesFeat.addEventListener('change', () => console.log("change"));

  // Change a single value; results in one update (one 'change' event firing).
  foldablesFeat.foldSize = 20;

  // Change multiple values by assignment; results in one update.
  Object.assign(foldablesFeat, { foldSize: 50, verticalViewportSegments: "2"});

  // Change multiple values in one scope; results in one update
  (function() { foldablesFeat.foldSize = 100; foldablesFeat.verticalViewportSegments = "2" })();
```

Documentation
===
Located [here](https://foldable-devices.github.io/viewportsegments-polyfill/docs/global.html).

Test suite
===

There are unfortunately no [web-platform-tests](https://github.com/w3c/web-platform-tests/) available yet.

Known issues
===

Check GitHub [here](https://github.com/foldable-devices/viewportsegments-polyfill/issues).

Learn more
===

- [Explainer](https://docs.microsoft.com/en-us/dual-screen/web/javascript-viewport-segments) - a document explaining how this feature was designed and how it fits together with other APIs.
- [CSS Viewport Segment Media Feature Polyfill](https://github.com/foldable-devices/viewportsegments-css-polyfill)