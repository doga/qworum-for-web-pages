# Qworum for web pages

This is [Qworum](https://qworum.net)'s official JavaScript library for web frontends.

Using this library, web pages can communicate with the Qworum browser extension for:

- executing Qworum scripts,
- reading session data (such as reading the call arguments for the current service call),
- writing session data.

## How to build

`rake build`

## Documentation

The documentation for the latest version of this library is available [here](https://qworum.net/docs/qworum-for-web-pages/latest/).

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. It can be imported in three ways:

- _(Recommended)_ Import from the Skypack CDN. Example: `import { Qworum } from "https://cdn.skypack.dev/@qworum/qworum-for-web-pages@1.0.11";`.
- Import by copying [the `qworum-for-web-pages.js` file on GitHub](https://github.com/doga/qworum-for-web-pages/blob/master/esm/qworum-for-web-pages.js) into a local file. For example you can name your local copy `qworum-for-web-pages.mjs` and import it thusly: `import { Qworum } from "path/to/qworum-for-web-pages.mjs";`.
- Use a bundler for importing from NPM. Search for `@qworum/qworum-for-web-pages` on NPM.

## Enabling Qworum for your website

By default this library (and the browser extension) will work as intended for [local development](https://qworum.net/en/developers/#local-development) only.

In order to enable Qworum for your internet or intranet website, consider purchasing a [subscription](https://qworum.net/en/pricing/).

## License

This software is released under the [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) license ∎
