/**
 * A JavaScript library that web pages should import in order to use the Qworum features of web browsers.
 * 
 * This library contains:
 * 
 * - Classes for creating Qworum scripts — `Json`, `SemanticData`, `Return`, `Sequence`, `Data`, `Try`, `Goto`, `Call`, `Fault`, `Script`.
 * 
 * - The `Qworum` class, for executing Qworum scripts, reading and writing session data, and checking that a browser provides Qworum capabilities.
 * 
 * This library will only work for websites that are part of Qworum's Service Web, which requires a subscription. 
 * 
 * @module Qworum for web pages
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @see {@link https://qworum.net/en/plans/ | Qworum Platform Plans}
 * @license  Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * 
 * @example Importing this library into a web page:
 * ```javascript
 * import {
 *   // For using the browsers' Qworum features
 *   Qworum,
 * 
 *   // For creating Qworum scripts and session data
 *   QworumScript as qs, 
 * 
 *   // For manipulating semantic RDF data in scripts and session data
 *   iri, irl, url, urn, IRI, IRL, URN, 
 *   rdfTermFactory
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.4/mod.mjs';
 * 
 * const
 * // Shortcuts for building Qworum scripts and session data
 * Json         = qs.Json.build,
 * SemanticData = qs.SemanticData.build,
 * Return       = qs.Return.build,
 * Sequence     = qs.Sequence.build,
 * Data         = qs.Data.build,
 * Try          = qs.Try.build,
 * Goto         = qs.Goto.build,
 * Call         = qs.Call.build,
 * Fault        = qs.Fault.build,
 * Script       = qs.Script.build;
 * ```
 * 
 * @example Checking that Qworum is enabled in the Web browser:
 * ```javascript
 * try{
 *   await Qworum.checkAvailability();
 * }catch(error){
 *   console.error('Install the Qworum browser extension or enable it.');
 * }
 * ```
 * 
 * @example Running a simple Qworum script:
 * ```javascript
 * await Qworum.eval(
 *   Script(
 *       Sequence(
 *         // Call a method of the current Qworum object
 *         Call('@', `../view-item`, { name: 'item id', value: Json(1) }),
 *   
 *         // Return to the current page in the current call
 *         Goto()
 *       ),
 *     )
 *   )
 * );
 * ```
 * 
 * @example Running a more complex Qworum script:
 * ```javascript
 * const
 * pathOfQworumObject = ['@', 'a qworum object'],
 * script = Script(
 *   Try(
 *     Sequence(
 *       // Initialise the Qworum object ? (May be required for Qworum classes that have instance properties)
 *       Try(
 *         // If the state of the Qworum object is readable, then the object exists.
 *         Data([...pathOfQworumObject, 'version']),
 *         { 
 *           catch: '* reference', 
 *           do: // the Qworum object does not exist; initialise it
 *           Call(
 *             pathOfQworumObject, 'https://a-qworum-service.example/a-qworum-class/new/',
 *             { name: 'initial state', value: Json({state: {xyz: '…'}}) }
 *           )
 *         }
 *       ),
 *       // Call the `edit` method of the Qworum object.
 *       Call(pathOfQworumObject, 'https://a-qworum-service.example/a-qworum-class/edit/'),
 * 
 *       // If the call to `edit` hasn't raised a fault, then the caller resumes its execution here.
 *       Goto('group-updated.html')
 *     ),
 *     { do: 
 *       // If the call to `edit` has raised a fault, then go back to the current web page.
 *       Goto() 
 *     }
 *   )
 * );
 * 
 * // Run the Qworum script in the web page. The end-user will experience this as a redirection.
 * await Qworum.eval(script);
 * ```
 * 
 * @example Reading/writing data from within web pages:
 * ```javascript
 * let data = await Qworum.getData(['path', 'to', 'data']);
 * 
 * if(!data) {
 *   data = Json('some data');
 *   await Qworum.setData(['path', 'to', 'data'], data);
 * }
 * 
 * data.value === "some data"; // true
 * ```
 * 
 * @see {@link https://qworum.net/en/developers/ | Qworum developer resources}
 */

// RDF ----------------------

import { iriTools } from './deps.mjs';

/**
 * A string-to-URL converter. Returns null if the string is not a URL.
 * @example
 * ```javascript
 * const aUrl = url`https://site.example/`;
 * aUrl instanceOf URL; // true
 * aUrl instanceOf IRI; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const url = iriTools.url;

/**
 * A string-to-IRL converter. Returns null if the string is not a IRL.
 * An IRL is a non-standard yet useful way of representing URLs in Unicode.
 * @example
 * ```javascript
 * const anIrl = irl`https://çağlayan.info/user/çağlayan/`;
 * 
 * anIrl instanceOf IRL; // true
 * anIrl instanceOf IRI; // true
 * anIrl.href === 'https://çağlayan.info/user/çağlayan/'; // true
 * anIrl.url.href === 'https://xn--alayan-vua36b.info/user/%C3%A7a%C4%9Flayan/'; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const irl = iriTools.iri;

/**
 * A string-to-URN converter. Returns null if the string is not a URN.
 * @example
 * ```javascript
 * const aUrn = urn`urn:ietf:rfc:2648`;
 * 
 * aUrn instanceOf URN; // true
 * aUrn instanceOf IRI; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const urn = iriTools.urn;

/**
 * A string-to-IRI converter. Returns null if the string is not an IRI.
 * @example
 * ```javascript
 * const 
 * anIrl = iri`https://çağlayan.info/user/çağlayan/`,
 * aUrn  = iri`urn:ietf:rfc:2648`;
 * 
 * anIrl instanceOf IRL; // true
 * anIrl instanceOf IRI; // true
 * aUrn instanceOf URN; // true
 * aUrn instanceOf IRI; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const iri = iriTools.iri;

/**
 * A class that represents a IRL. An IRL is a non-standard yet useful way of representing URLs in Unicode. `IRI` is `IRL`'s parent class.
 * @example
 * ```javascript
 * const anIrl = irl`https://çağlayan.info/user/çağlayan/`;
 * 
 * anIrl instanceOf IRL; // true
 * anIrl instanceOf IRI; // true
 * anIrl.href === 'https://çağlayan.info/user/çağlayan/'; // true
 * anIrl.url.href === 'https://xn--alayan-vua36b.info/user/%C3%A7a%C4%9Flayan/'; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const IRL = iriTools.IRL;

/**
 * A class that represents a URN.
 * @example
 * ```javascript
 * const aUrn = urn`urn:ietf:rfc:2648`;
 * 
 * aUrn instanceOf URN; // true
 * aUrn instanceOf IRI; // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const URN = iriTools.URN;

/**
 * A class that represents an IRI. `IRL` and `URN` have this class as their parent class.
 * @example
 * ```javascript
 * const 
 * anIrl = iri`https://çağlayan.info/user/çağlayan/`,
 * aUrn  = iri`urn:ietf:rfc:2648`;
 * 
 * anIrl instanceOf IRL; // true
 * anIrl instanceOf IRI; // true
 * aUrn instanceOf URN;  // true
 * aUrn instanceOf IRI;  // true
 * ```
 * @see {@link https://github.com/doga/IRI | The IRI JavaScript module}
 */
const IRI = iriTools.IRI;


export { 
  IRI, IRL, URN, iri, irl, url, urn,
};

import { N3 } from './deps.mjs';

/**
 * A JavaScript object that contains factory functions for different types of RDF terms, such as `namedNode` and `literal`
 * @type {Object}
 * @example Using this factory for creating RDF terms and adding them to RDF datasets
 * ```javascript
 * const
 * subject         = rdfTermFactory.namedNode(irl`https://meşe.example/#çağlayan`.href),
 * isNamed         = rdfTermFactory.namedNode('http://xmlns.com/foaf/0.1/name'),
 * JonDo           = rdfTermFactory.literal('Jon Do'),
 * dateDatatype    = rdfTermFactory.namedNode('http://www.w3.org/2001/XMLSchema#date'),
 * aDateLiteral    = rdfTermFactory.literal('2026-05-28', dateDatatype),
 * aBlankNode      = rdfTermFactory.blankNode('b123'),
 * theDefaultGraph = rdfTermFactory.defaultGraph(),
 * semanticData    = SemanticData(); // `semanticData.value` conforms to RDF/JS's `Dataset` interface.
 * 
 * semanticData.value.add(
 *   rdfTermFactory.quad(subject, isNamed, JonDo)
 * );
 * ```
 * @see {@link https://rdf.js.org/data-model-spec/#datafactory-interface | DataFactory interface}
 * @see {@link https://rdf.js.org/dataset-spec/#dataset-interface | Dataset interface}
 */
const rdfTermFactory = N3.DataFactory;

export {rdfTermFactory};

// Qworum ----------------------
export {
  QworumScript, 

  Json, SemanticData, 

  DataValue, GenericData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
} from "./lib/qworum-script.mjs";

export { Qworum } from "./lib/qworum.mjs";
