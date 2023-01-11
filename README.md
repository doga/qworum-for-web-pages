# Qworum for web pages

Qworum JavaScript library for use inside web pages on web browsers.
Qworum is the _Service Web_ that enables distributed web applications. See the [Qworum website](https://qworum.net).

With this library web pages can:

1. verify that the Qworum extension is installed and enabled on the end-user's browser.
1. use Qworum's capabilities by communicating with the Qworum browser extension.

## Usage

1. First, copy and paste [qworum-for-web-pages.js](https://github.com/doga/qworum-for-web-pages/blob/master/qworum-for-web-pages.js) into your web frontend project directory.
1. Then create a JavaScript file for your web frontend project and link it to your web page like this: `<script type="module" src="./path/to/your.js"></script>`. [Example](https://github.com/doga/qworum-demo/blob/master/src/websites/shop.demo.qworum.net/home/index.html).
1. After that, import the Qworum library like this in _your.js_: `import { Qworum } from "./path/to/qworum-for-web-pages.js";`. [Example](https://github.com/doga/qworum-demo/blob/master/src/websites/shop.demo.qworum.net/_assets/js/home.js).

Sample frontend projects that show how this library is used:

- [Demo that uses JSON as its data format](https://github.com/doga/qworum-demo).
- [Demo that uses RDF-based semantic data formats such as JSON-LD and N-Quads](https://github.com/doga/qworum-demo-semantic).

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) ∎
