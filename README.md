![Qworum logo and name](https://raw.githubusercontent.com/doga/qworum-website/master/build/assets/images/logos/Qworum-logo-and-name.svg "Qworum logo and name")

# Qworum for web pages

This is [Qworum](https://qworum.net)'s official JavaScript library for web frontends.

## Documentation

The documentation for the latest version of this library is available [here](https://qworum.net/docs/qworum-for-web-pages/latest/Qworum.html).

## Some projects that are using this library

[Template for a Qworum application that uses RDF data](https://github.com/doga/qworum-application-template-with-semantic-data).

## How to import this library in a web page

`import { QworumScript, Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.7.0/mod.mjs";`

## Activating Qworum for a website

Qworum provides advanced browser capabilities through a browser extension.
By default Qworum is actived for [local development](https://qworum.net/en/developers/#local-development) only.
Activating Qworum for a website requires a [subscription](https://qworum.net/en/plans/).

## Usage

_Tip: Run the examples below by typing this in your terminal (requires [Deno](https://deno.com/) 2+):_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  jsr:@andrewbrey/mdrb@3.0.4 \
  --dax=false \
  https://raw.githubusercontent.com/doga/qworum-for-web-pages/master/README.md
```

<details data-mdrb>
<summary>Generate a Qworum script in-memory.</summary>

<pre>
description = '''
Running this code is safe.
'''
</pre>
</details>

```javascript
import { QworumScript, Qworum } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.7.0/mod.mjs';

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

console.info(`${script}`);

// In a browser the Qworum extension would run the Qworum script.
// await Qworum.eval(script);
```

Sample output for the code above:

```text
Sequence(Call(object: [@, shopping cart], href: https://shopping-cart.example/view/),Goto(href: /home/))
```

<details data-mdrb>
<summary>Create semantic data sourced from a Turtle file.</summary>

<pre>
description = '''
Running this code is safe.
'''
</pre>
</details>

```javascript
import { SemanticData, Qworum } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.7.0/mod.mjs';

const org = new SemanticData();

await org.readFromUrl(new URL('https://qworum.net/data/org.ttl'));

console.info(`${org}`);

// In a browser the Qworum extension could store this as session data.
// await Qworum.setData('Organisation', org);
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

<details data-mdrb>
<summary>Qworum scripts must not contain platform faults.</summary>

<pre>
description = '''
Running this code is safe.
'''
</pre>
</details>

```javascript
import { QworumScript, Qworum } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.7.0/mod.mjs';

const
Script     = QworumScript.Script.build,
Fault      = QworumScript.Fault.build,
faultTypes = ['* entitlement', 'payment cancelled', null];

for(const faultType of faultTypes){
  try{
    const script = Script(Fault(faultType));
    console.info(`${script}`);
  }catch(error){
    console.error(`${error}`);
  }
}
```

Sample output for the code above:

```text
TypeError: not a service-specific fault: '* entitlement'
Fault(type: payment cancelled)
Fault(type: * service-specific)
```

## License

This software is released under the terms of the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0).

∎
