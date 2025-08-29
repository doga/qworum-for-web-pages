/**
 * `Qworum for web pages` is a JavaScript library through which websites can access the Qworum features of web browsers.
 * @module Qworum for web pages <https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs>
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license  Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * @example How to run Qworum scripts. Here a website that is part of Qworum's Service Web is calling a remote Qworum service in a Qworum session.
 * ```javascript
 * // JavaScript code for web frontends.
 * import {
 *   QworumScript, Qworum
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * const
 * // Shortcuts for building Qworum scripts.
 * Json         = QworumScript.Json.build,
 * SemanticData = QworumScript.SemanticData.build,
 * Return       = QworumScript.Return.build,
 * Sequence     = QworumScript.Sequence.build,
 * Data         = QworumScript.Data.build,
 * Try          = QworumScript.Try.build,
 * Goto         = QworumScript.Goto.build,
 * Call         = QworumScript.Call.build,
 * Fault        = QworumScript.Fault.build,
 * Script       = QworumScript.Script.build,
 * // The Qworum script to be executed.
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
 * 
 * );
 * 
 * // Run the Qworum script in the web page. The end-user will experience this as a redirection.
 * await Qworum.eval(script);
 * ```
 * @example How to read and write session state outside of Qworum scripts.
 * ```javascript
 * import {
 *   QworumScript, Qworum
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * const 
 * Json = QworumScript.Json.build,
 * data = await Qworum.getData(['path', 'to', 'data']);
 * 
 * if(!data) await Qworum.setData(['path', 'to', 'data'], Json('some data'));
 * ```
 * @example How to read the persona for the current Qworum session.
 * ```javascript
 * import {
 *   Persona, GroupId, UserId, GroupIdSet, Qworum,
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * // Read the persona.
 * const persona = await Qworum.getPersona(); // Qworum will launch a user dialog if required.
 * 
 * if(persona){
 *   console.debug(`User: ${persona.userId}`);
 *   console.debug(`User roles: ${persona.userRoleIds.map(id => `${id}`).join(' ')}`);
 *   console.debug(`Group: ${persona.groupId}`);
 *   console.debug(`Group roles: ${persona.groupRoleIds.map(id => `${id}`).join(' ')}`);
 *   // Is the group in a partnership with other groups?
 *   if(persona.partnerGroupIds){
 *     console.debug(`Partner groups: ${persona.partnerGroupIds.members.map(id => `${id}`).join(' ')}`);
 *   }
 * } else {
 *   // The persona has still not been set by the end-user. 2 options at this point:
 *   // 1. Allow the end-user to remain anonymous.
 *   // 2. Call `Qworum.getPersona()` once again.
 * }
 * ```
 * 
 * @see {@link https://qworum.net/en/developers/|Qworum developer resources}
 */

// domain model
// export { IriParser, IRI, IRL, URN, iri, irl, url, urn } from './deps.mjs';

export { 
  GroupId, UserId, GroupIdSet,
  Persona,
  Role, Roleset, defaultRoleset,
} from './deps.mjs';

// runtime
export {
  QworumScript, 

  // Json, SemanticData, 

  // DataValue, GenericData, 
  // Instruction, 
  // Return, Sequence, Data, Try, Goto, Call, Script,
  // Fault, 
} from "./lib/qworum-script.mjs";

export { Qworum } from "./lib/qworum.mjs";
