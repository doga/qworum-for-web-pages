![Qworum logo and name](https://raw.githubusercontent.com/doga/qworum-website/master/build/assets/images/logos/Qworum-logo-and-name.svg "Qworum logo and name")

# Qworum for web pages

This is [Qworum](https://qworum.net)'s official JavaScript library for web frontends.

## Documentation

The documentation for the latest version of this library is available [here](https://qworum.net/docs/qworum-for-web-pages/latest/Qworum.html).

## How to import this library into your frontend code

This library is an ECMAScript module that does not have any dependencies. Importing this library is simple:

- `import { QworumScript, Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.5.7/mod.mjs";`

## Enabling Qworum for your website

By default this library (and the browser extension) will work as intended for [local development](https://qworum.net/en/developers/#local-development) only.

Enabling Qworum for your internet or intranet website requires a [subscription](https://qworum.net/en/plans/).

## Usage

_Tip: Run the examples below by typing this in your terminal (requires Deno):_

```shell
deno run \
  --allow-net --allow-run --allow-env --allow-read \
  https://deno.land/x/mdrb@2.0.0/mod.ts \
  --dax=false --mode=isolated \
  https://raw.githubusercontent.com/doga/qworum-for-web-pages/master/README.md
```

<details data-mdrb>
<summary>Generate a Qworum script in-memory, and print out a human-readable description.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { QworumScript } from "./mod.mjs";
// import { QworumScript } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.5.7/mod.mjs";

const script = QworumScript.Script.build(
  QworumScript.Sequence.build(
    // Show the user's shopping cart
    QworumScript.Call.build(["@", "shopping cart"], "https://shopping-cart.example/view/"),

    // Go back to the online shop
    QworumScript.Goto.build("/home/")
  )
);
console.info(`${script}`);
```

Sample output for the code above:

```text

```

<details data-mdrb>
<summary>Generate an semantic data container, fill it with Turtle files, and print out as Turtle.</summary>

<pre>
description = '''
Running this example is safe, it will not read or write anything to your filesystem.
'''
</pre>
</details>

```javascript
import { QworumScript } from "./mod.mjs";
// import { QworumScript } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.5.7/mod.mjs";

const
sd = new QworumScript.SemanticData(),
turtle = [
  `
  PREFIX : <#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>            # https://en.wikipedia.org/wiki/FOAF 
  PREFIX dcterms: <http://purl.org/dc/terms/>          # https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
  PREFIX cc: <http://creativecommons.org/ns#>
  PREFIX schema: <https://schema.org/>

  <org.ttl>
    a foaf:Document;
    dcterms:description 'Organisation description.'@en;
    foaf:maker :DoğaArmangil;
    foaf:primaryTopic :id;
    cc:license <license/content.ttl#non-commercial>;
    a schema:CreativeWork;
    schema:encodingFormat
      'text/turtle',
      <https://www.iana.org/assignments/media-types/text/turtle>.
  `,

  `
  PREFIX : <#>
  PREFIX org: <http://www.w3.org/ns/org#>              # https://www.w3.org/TR/vocab-org/ 

  :id
    a org:Organization;
    org:purpose    
      'Qworum is a provider of enterprise infrastructure software, with the overarching goal of making the web a fully fledged platform for applications.'@en;
    org:Site <locations.ttl#geneva>.
  `,
]
console.debug(`𝑹𝑬𝑨𝑫𝑰𝑵𝑮 𝑻𝑼𝑹𝑻𝑳𝑬 𝑪𝑶𝑵𝑻𝑬𝑵𝑻:\n${turtle[0]}`);
await sd.readFromText(turtle[0], new URL('https://site.example/'));
console.debug(`\n𝑹𝑬𝑨𝑫𝑰𝑵𝑮 𝑻𝑼𝑹𝑻𝑳𝑬 𝑪𝑶𝑵𝑻𝑬𝑵𝑻:\n${turtle[1]}`);
await sd.readFromText(turtle[1], new URL('https://site2.example/'));
console.info(`\n𝑼𝑵𝑰𝑶𝑵 𝑶𝑭 𝑨𝑳𝑳 𝑹𝑬𝑨𝑫 𝑫𝑨𝑻𝑨, 𝑰𝑵 𝑻𝑹𝑰𝑮 𝑭𝑶𝑹𝑴𝑨𝑻:\n${sd.toString()}`);
```

Sample output for the code above:

```text
𝑹𝑬𝑨𝑫𝑰𝑵𝑮 𝑻𝑼𝑹𝑻𝑳𝑬 𝑪𝑶𝑵𝑻𝑬𝑵𝑻:

  BASE <https://qworum.net/data/org.ttl>
  PREFIX : <#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>            # https://en.wikipedia.org/wiki/FOAF
  PREFIX dcterms: <http://purl.org/dc/terms/>          # https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
  PREFIX cc: <http://creativecommons.org/ns#>
  PREFIX schema: <https://schema.org/>

  <org.ttl>
    a foaf:Document;
    dcterms:description 'Organisation description.'@en;
    foaf:maker :DoğaArmangil;
    foaf:primaryTopic :id;
    cc:license <license/content.ttl#non-commercial>;
    a schema:CreativeWork;
    schema:encodingFormat
      'text/turtle',
      <https://www.iana.org/assignments/media-types/text/turtle>.


𝑹𝑬𝑨𝑫𝑰𝑵𝑮 𝑻𝑼𝑹𝑻𝑳𝑬 𝑪𝑶𝑵𝑻𝑬𝑵𝑻:

  BASE <https://qworum.net/data/org.ttl>
  PREFIX : <#>
  PREFIX org: <http://www.w3.org/ns/org#>              # https://www.w3.org/TR/vocab-org/

  :id
    a org:Organization;
    org:purpose
      'Qworum is a provider of enterprise infrastructure software, with the overarching goal of making the web a fully fledged platform for applications.'@en;
    org:Site <locations.ttl#geneva>.


𝑼𝑵𝑰𝑶𝑵 𝑶𝑭 𝑨𝑳𝑳 𝑹𝑬𝑨𝑫 𝑫𝑨𝑻𝑨, 𝑰𝑵 𝑻𝑼𝑹𝑻𝑳𝑬 𝑭𝑶𝑹𝑴𝑨𝑻:
@prefix : <https://qworum.net/data/org.ttl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.
@prefix dcterms: <http://purl.org/dc/terms/>.
@prefix cc: <http://creativecommons.org/ns#>.
@prefix schema: <https://schema.org/>.
@prefix org: <http://www.w3.org/ns/org#>.

<https://qworum.net/data/org.ttl> a foaf:Document, schema:CreativeWork;
    dcterms:description "Organisation description."@en;
    foaf:maker <https://qworum.net/data/org.ttl#DoğaArmangil>;
    foaf:primaryTopic :id;
    cc:license <https://qworum.net/data/license/content.ttl#non-commercial>;
    schema:encodingFormat "text/turtle", <https://www.iana.org/assignments/media-types/text/turtle>.
:id a org:Organization;
    org:purpose "Qworum is a provider of enterprise infrastructure software, with the overarching goal of making the web a fully fledged platform for applications."@en;
    org:Site <https://qworum.net/data/locations.ttl#geneva>.
```

## License

This software is released under the terms of the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0).

∎
