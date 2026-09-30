# @mosaic/utils

## Install

```bash
npm install @mosaic/utils
```

If you prefer Yarn over npm, use this command to install the Mosaic utils package:

```bash
yarn add @mosaic/utils
```

## API

### `serializeAsJSON`

See [`serializeAsJSON`](https://github.com/excalidraw/excalidraw/blob/master/src/packages/mosaic/README.md#serializeAsJSON) for API and description.

### `exportToBlob` (async)

Export an Mosaic diagram to a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

### `exportToSvg`

Export an Mosaic diagram to a [SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement).

## Usage

Mosaic utils is published as a UMD (Universal Module Definition). If you are using a module bundler (for instance, Webpack), you can import it as an ES6 module:

```js
import { exportToSvg, exportToBlob } from "@mosaic/utils";
```

To use it in a browser directly:

```html
<script src="https://unpkg.com/@mosaic/utils@0.1.0/dist/excalidraw-utils.min.js"></script>
<script>
  // MosaicUtils is a global variable defined by mosaic.min.js
  const { exportToSvg, exportToBlob } = MosaicUtils;
</script>
```

Here's the `exportToBlob` and `exportToSvg` functions in action:

```js
const mosaicDiagram = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements: [
    {
      id: "vWrqOAfkind2qcm7LDAGZ",
      type: "ellipse",
      x: 414,
      y: 237,
      width: 214,
      height: 214,
      angle: 0,
      strokeColor: "#000000",
      backgroundColor: "#15aabf",
      fillStyle: "hachure",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [],
      roundness: null,
      seed: 1041657908,
      version: 120,
      versionNonce: 1188004276,
      isDeleted: false,
      boundElementIds: null,
    },
  ],
  appState: {
    viewBackgroundColor: "#ffffff",
    gridSize: null,
  },
};

// Export the Mosaic diagram as SVG string
const svg = exportToSvg(mosaicDiagram);
console.log(svg.outerHTML);

// Export the Mosaic diagram as PNG Blob URL
(async () => {
  const blob = await exportToBlob({
    ...mosaicDiagram,
    mimeType: "image/png",
  });

  const urlCreator = window.URL || window.webkitURL;
  console.log(urlCreator.createObjectURL(blob));
})();
```
