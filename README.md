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
  --dax=false --mode=isolated \
  https://raw.githubusercontent.com/doga/qworum-for-web-pages/master/README.md
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
import { QworumScript, Qworum } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.4.0/mod.mjs";
const script = 
QworumScript.Script.build(
  QworumScript.Sequence.build(
    // Show the user's shopping cart
    QworumScript.Call.build(["@", "shopping cart"], "https://shopping-cart.example/view/"),

    // Go back to the current e-shop
    QworumScript.Goto.build("/home/")
  )
);
console.info(`Script in XML format:\n${script.toXml()}`);
```

Sample output for the code above:

```text
Script in XML:
<q:sequence xmlns:q="https://qworum.net/ns/v1/instruction/"><q:call object="[&quot;@&quot;,&quot;shopping cart&quot;]" href="https://shopping-cart.example/view/"></q:call><q:goto href="/home/"></q:goto></q:sequence>
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
import { QworumScript } from "https://esm.sh/gh/doga/qworum-for-web-pages@1.4.0/mod.mjs";
const
sd = new QworumScript.SemanticData(),
turtle = [
  `
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
  `,

  `
  BASE <https://qworum.net/data/org.ttl>
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
await sd.readFromText(turtle[0]);
console.debug(`\n𝑹𝑬𝑨𝑫𝑰𝑵𝑮 𝑻𝑼𝑹𝑻𝑳𝑬 𝑪𝑶𝑵𝑻𝑬𝑵𝑻:\n${turtle[1]}`);
await sd.readFromText(turtle[1]);
console.info(`\n𝑼𝑵𝑰𝑶𝑵 𝑶𝑭 𝑨𝑳𝑳 𝑹𝑬𝑨𝑫 𝑫𝑨𝑻𝑨, 𝑰𝑵 𝑻𝑼𝑹𝑻𝑳𝑬 𝑭𝑶𝑹𝑴𝑨𝑻:\n${sd.toRawString()}`);
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

∎
