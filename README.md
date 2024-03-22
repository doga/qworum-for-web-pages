# Qworum for web pages

This is [Qworum](https://qworum.net)'s official JavaScript library for web frontends.

## Documentation

The documentation for the latest version of this library is available [here](https://qworum.net/docs/qworum-for-web-pages/latest/Qworum.html).

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { QworumScript, Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.4.0/mod.mjs";`

## Enabling Qworum for your website

By default this library (and the browser extension) will work as intended for [local development](https://qworum.net/en/developers/#local-development) only.

Enabling Qworum for your internet or intranet website requires a [subscription](https://qworum.net/en/plans/).

## Usage

_Tip (requires Deno): Run the following example by typing this in your terminal:_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  https://deno.land/x/mdrb/mod.ts \
  https://raw.githubusercontent.com/doga/object-semantic-mapping/main/README.md
```

<details data-mdrb>
<summary>Generate a Qworum script in-memory, and print it out as XML.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { QworumScript, Qworum } from "./mod.mjs";
const script = 
Qworum.Script(
  Qworum.Sequence(
    // Show the user's shopping cart
    Qworum.Call(["@", "shopping cart"], "https://shopping-cart.example/view/"),

    // Go back to the current e-shop
    Qworum.Goto("/home/")
  )
);
console.info(`Script in XML: ${script.toXml()}`);
```

Sample output for the code above:

```text

```

∎
