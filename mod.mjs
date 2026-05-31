/**
 * A JavaScript library through which websites can access the Qworum features of web browsers.
 * @module Qworum for web pages
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license  Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * @example How to run Qworum scripts. Here a website that is part of Qworum's Service Web is calling a remote Qworum service in a Qworum session.
 * ```javascript
 * // JavaScript code for web frontends.
 * import {
 *   QworumScript as qs, Qworum
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
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
 * Script       = qs.Script.build,
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
 *   QworumScript as qs, Qworum, 
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * const 
 * Json = qs.Json.build,
 * data = await Qworum.getData(['path', 'to', 'data']);
 * 
 * if(!data) await Qworum.setData(['path', 'to', 'data'], Json('some data'));
 * ```
 * @example How to read the persona for the current Qworum session.
 * ```javascript
 * import {
 *   Persona, GroupId, UserId, GroupIdSet, Qworum,
 *   Vcard, IndividualVcard, GroupVcard, OrgVcard, Name, Email, Phone, Photo, Address, Types
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * // Read the persona.
 * const persona = await Qworum.getPersona(); // Qworum will launch a user dialog if required.
 * 
 * if(persona){
 *   console.debug(`User: ${persona.userId}`);
 *   console.debug(`User's Vcard: formattedName="${persona.userVcard.formattedName}"`);
 *   console.debug(`User roles: ${persona.userRoleIds.map(id => `${id}`).join(' ')}`);
 *   console.debug(`Group: ${persona.groupId}`);
 *   console.debug(`Group's Vcard: formattedName="${persona.groupVcard.formattedName}"`);
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
 * @example How to create a roleset for an application or an application category. A roleset is simply a set of URLs and/or IRLs (a Qworum-specific Unicode-aware variant of URLs) that have the same web origin, but the Roleset utility class presented here only allows IRLs.
 * ```javascript
 * import {
 *   Role, Roleset, Language, I18nText, IRL, irl
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * const
 * en = Language.fromCode('en'),
 * 
 * rolesetId = irl`https://site.example/id/roleset/`,
 * 
 * description = new I18nText().setText('A capability-based roleset for Qworum services. This roleset is agnostic in terms of application category. Alternatively, applications have the option of using another roleset that is specific to their software categories. To this end, applications can define their own rolesets, or use third-party rolesets that are targeting their software vertical.', en),
 * 
 * downloader = new Role({
 *   roleId      : irl`${rolesetId}downloader`,
 *   description : new I18nText().setText('The user can download from the Qworum service any data that belongs to the group.', en)
 * }),
 * 
 * uploader = new Role({
 *   roleId      : irl`${rolesetId}uploader`,
 *   parentRoleId: downloader.roleId,
 *   description : new I18nText().setText('The user can upload data that belongs to the group or the persona.', en)
 * }),
 * 
 * transferrer = new Role({
 *   roleId      : irl`${rolesetId}transferrer`,
 *   description : new I18nText().setText('The user can transfer to another group the ownership of any data that belongs to the group.', en)
 * }),
 * 
 * reader = new Role({
 *   roleId      : irl`${rolesetId}reader`,
 *   description : new I18nText().setText('The user can read group-owned data.', en)
 * }),
 * 
 * upserter = new Role({
 *   roleId      : irl`${rolesetId}upserter`,
 *   parentRoleId: reader.roleId,
 *   description : new I18nText().setText('The user can create and update and read group-owned data, but not delete the data.', en)
 * }),
 * 
 * writer = new Role({
 *   roleId      : irl`${rolesetId}writer`,
 *   parentRoleId: upserter.roleId,
 *   description : new I18nText().setText('The user can create, read, update and delete group-owned data.', en)
 * }),
 * 
 * roleset = new Roleset({
 *   rolesetId, description,
 *   roles: [downloader, uploader, transferrer, reader, upserter, writer]
 * });
 * ```
 * @example How to verify that a persona has a certain role. Role IDs can be either URLs or IRLs.
 * ```javascript
 * import {
 *   Persona, irl, Qworum
 * } from 'https://esm.sh/gh/doga/qworum-for-web-pages@1.8.2/mod.mjs';
 * 
 * const persona = await Qworum.getPersona();
 * if(persona){
 *   const
 *   readerRoleId = new URL('https://site.example/id/roleset/reader'),
 *   writerRoleId = irl`https://site.example/id/roleset/writer`, // implies read permissions
 *   canRead      = persona.hasRole(readerRoleId, [writerRoleId]),
 *   canWrite     = persona.hasRole(writerRoleId);
 * }
 * ```
 * 
 * @see {@link https://qworum.net/en/developers/ | Qworum developer resources}
 */

// domain model
// export { IriParser, IRI, IRL, URN, iri, irl, url, urn } from './deps.mjs';

export { 
  GroupId, UserId, GroupIdSet,
  Vcard, IndividualVcard, GroupVcard, OrgVcard, Name, Email, Phone, Photo, Address, Types,
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
