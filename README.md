![Qworum logo and name](https://raw.githubusercontent.com/doga/qworum-website/master/build/assets/images/logos/Qworum-logo-and-name.svg "Qworum logo and name")

# Qworum for web pages

This is [Qworum](https://qworum.net)'s official JavaScript library for web frontends.

## Documentation

The documentation for the latest version of this library is available [here](https://qworum.net/docs/qworum-for-web-pages/latest/Qworum.html).

## How to import this library in a web page

`import { QworumScript, Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.6.5/mod.mjs";`

## Activating Qworum for a website

Qworum provides advanced browser capabilities through a browser extension.
By default Qworum is actived for [local development](https://qworum.net/en/developers/#local-development) only.
Activating Qworum for a website requires a [subscription](https://qworum.net/en/plans/).

## Usage

_Tip: Run the examples below by typing this in your terminal (requires Deno):_

```shell
deno run --allow-net --allow-run --allow-env --allow-read --location https://site.example/a/page.html https://deno.land/x/mdrb@2.0.0/mod.ts --dax=false --mode=isolated https://raw.githubusercontent.com/doga/qworum-for-web-pages/master/README.md
```

<details data-mdrb>
<summary>Generate a Qworum script in-memory. (In a browser the Qworum extension would run the Qworum script.)</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { QworumScript, Qworum } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.6.5/mod.mjs';

const
Script   = QworumScript.Script.build,
Sequence = QworumScript.Sequence.build,
Call     = QworumScript.Call.build,
Goto     = QworumScript.Goto.build,
script   = Script(
  Sequence(
    Call(['@', 'shopping cart'], 'https://shopping-cart.example/view/'),
    Goto("/home/")
  )
);

// await Qworum.eval(script);
console.info(`${script}`);
```

Sample output for the code above:

```text
Sequence(Call(object: [@, shopping cart], href: https://shopping-cart.example/view/),Goto(href: /home/))
```

<details data-mdrb>
<summary>Create semantic data sourced from a Turtle file. (In a browser the Qworum extension could store this as session data.)</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { SemanticData, Qworum } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.6.5/mod.mjs';

const org = new SemanticData();

await org.readFromUrl(new URL('https://qworum.net/data/org.ttl'));

// await Qworum.setData('Organisation', org);
console.info(`${org}`);
```

Sample output for the code above:

```text
SemanticData(
  …
  <https://qworum.net/data/org.ttl#id> a <http://www.w3.org/ns/org#Organization>, <https://w3id.org/okn/o/sd#Organization>;
      <http://www.w3.org/ns/org#purpose> "Qworum is a provider of enterprise infrastructure software, with the overarching goal of making the web a fully fledged platform for applications."@en;
  …
)
```

## License

This software is released under the terms of the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0).

∎
