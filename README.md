# Tweakpane image plugin
Image input plugin for [Tweakpane][tweakpane].

This is a fork of [metehus/tweakpane-image-plugin](https://github.com/metehus/tweakpane-image-plugin) for Tweakpane 3, used by [threepipe](https://threepipe.org) (the upstream moved to Tweakpane 4). It is published to npm as `@threepipe/tweakpane-image-plugin`. Changes: [CHANGELOG.md](CHANGELOG.md).
![image](https://user-images.githubusercontent.com/22124518/133916776-a5340b89-025d-44a2-bdc3-87bd11b468db.png)


Check out the [demo][demo].

## Features
- Accepts images and URLs
- Image input
- Drag and drop
- Placeholders

## Installation
You can install [this package][npm-link] via NPM:
```sh
npm i @threepipe/tweakpane-image-plugin
```

## Usage

You can use this plugin using these parameters:
```ts
pane.addInput(params, 'url', {
  view: 'input-image';
  imageFit?: 'contain' | 'cover';
  extensions?: string[];
})
```

## Example

```js
import {Pane} from 'tweakpane';
import * as TweakpaneImagePlugin from '@threepipe/tweakpane-image-plugin';

const pane = new Pane();
pane.registerPlugin(TweakpaneImagePlugin);

const params = {
  image: new Image(),
  placeholder: 'placeholder',
  url: 'https://images.unsplash.com/photo-1631875182291-17e8310183ed?q=80&w=500'
};

pane.addInput(params, 'image', {
  extensions: '.jpg, .gif',
})

pane.addInput(params, 'placeholder', {
  view: 'input-image'
})

pane.addInput(params, 'url', {
  view: 'input-image',
  imageFit: 'contain',
})
```

[tweakpane]: https://github.com/cocopon/tweakpane/
[npm-link]: https://www.npmjs.com/package/@threepipe/tweakpane-image-plugin
[demo]: https://tweakpane-image-plugin.netlify.app/
