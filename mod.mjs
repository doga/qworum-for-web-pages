/**
 * A JavaScript library that web pages should import in order to use the Qworum features of web browsers.
 * 
 * This library contains:
 * 
 * - Classes for creating Qworum scripts, such as `Json`, `SemanticData`, `Return`, `Sequence`, `Data`, `Try`, `Goto`, `Call`, `Fault`, `Script`.
 * 
 * - The `Qworum` class for using the browsers' Qworum features, such as executing Qworum scripts, reading and writing session data, and checking that a browser provides Qworum capabilities.
 * 
 * This library will only work for websites that are part of Qworum's Service Web, which requires a subscription. 
 * 
 * @module Qworum for web pages
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @see {@link https://qworum.net/en/plans/ | Qworum Platform Plans}
 * @license  Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
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
 * @example Importing this library into a web page:
 * ```javascript
 * import {
 *   QworumScript as qs, Qworum
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.3/mod.mjs';
 * 
 * const
 * // Shortcuts for building Qworum scripts.
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
 * // The Qworum script to be executed.
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
 *       Call(pathOfQworumObject, `https://a-qworum-service.example/a-qworum-class/edit/`),
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

// domain model
// export { IriParser, IRI, IRL, URN, iri, irl, url, urn } from './deps.mjs';

// export { 
//   GroupId, UserId, GroupIdSet,
//   Vcard, IndividualVcard, GroupVcard, OrgVcard, Name, Email, Phone, Photo, Address, Types,
//   Persona,
//   Role, Roleset, defaultRoleset,
// } from './deps.mjs';

// runtime
export {
  QworumScript, 

  Json, SemanticData, 

  DataValue, GenericData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
} from "./lib/qworum-script.mjs";

export { Qworum } from "./lib/qworum.mjs";
