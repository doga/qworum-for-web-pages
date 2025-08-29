/**
 * Defines the Qworum class through which web pages can access the Qworum features of web browsers.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license Apache-2.0
 * @see {@link https://qworum.net | Qworum}
 */

import { 
  // Id, OrgId, GroupId, UserId, PasswordId, MembershipId, PartnershipId, PartnershipMembershipId,
  // org_id, group_id, user_id, membership_id, partnership_id, partnership_membership_id,
  // bareorg_id, baregroup_id, bareuser_id, barepartnership_id,

  Persona,

  // Role, Roleset, defaultRoleset,
} from '../deps.mjs';

import {
  DataValue, GenericData, Json, SemanticData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
} from "./qworum-script.mjs";

const apiVersion = '1.0';

/**
 * Web pages can use the Qworum capabilities of web browsers through this JavaScript class.
 * 
 * These are the main methods that web pages use:
 * 
 * - `eval()` evaluates a Qworum script.
 * - `setData()` sets the value of a data container.
 * - `getData()` reads the value of a data container.
 * 
 * Other methods:
 * 
 * - `checkAvailability()` verifies that Qworum is available on the user's web browser.
 * 
 * All these methods are asynchronous.
 * 
 * @example Check the browser's Qworum availability status.
 * ```javascript
 * try{
 *   await Qworum.checkAvailability();
 * }catch(error){
 *   console.error('Qworum browser extension not installed or not enabled.');
 * }     
 * ```
 * 
 * @example Raise a Fault
 * ```javascript
 * await Qworum.eval(
 *   Script.build(Fault.build('payment cancelled'))
 * );
 * ```
 * 
 * @example Store data in the current Qworum method call.
 * ```javascript
 * await Qworum.setData('year', Qworum.Json(2024));
 * ```
 * 
 * @example Read data stored in the current Qworum method call.
 * ```javascript
 * const result = await Qworum.getData(['year']);
 * console.info(JSON.stringify(result.value));
 * ```
 */
class Qworum {

  /** 
   * Checks that:
   * 
   * - the Qworum browser extension is installed and running, and
   * - the website's DNS domain is part of Qworum's Service Web.
   * @static
   * @async
   * @return {Promise<null>} Can throw an Error.
   * @example Check Qworum availability in browser
   * ```javascript
   * try{
   *   await Qworum.checkAvailability();
   * }catch(error){
   *   console.error('Qworum browser extension not installed or not enabled.');
   * }
   * ```
   */
  static async checkAvailability() {
    try {
      const
      request  = { apiVersion, endpoint: 'Check Qworum availability', body: {} },
      response = await this._sendRequest(request);
      
      if (!`${response.status.code}`.startsWith('2')) {
        throw new Error(`Internal error: response ${response.status.code} ${response.status.message}`);
      }

      return Promise.resolve(null);

    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** 
   * Evaluates a Qworum script.
   * 
   * The outcome is one of:
   * - Redirection to a new URL (the current Qworum session continues).
   * - Closing of the browser tab after displaying an alert window (the current Qworum session has terminated).
   * 
   * @static
   * @async
   * @param {Script} script
   * @return {Promise<void>} Can throw a TypeError or Error.
   * @example
   * ```javascript
   * const
   * Script = Qworum.Script,
   * Goto   = Qworum.Goto;
   * 
   * await Qworum.eval(
   *   Script(
   *     Goto('next-phase/')
   *   )
   * );
   * ```
   * @see {@link https://qworum.net/en/specification-v1/#script|Script definition in the Qworum specification}
   */
  static async eval(script) {
    Qworum._log(`[Qworum.eval] checking arg... ${script}`, script);
    Qworum._log(`[Qworum.eval] (script instanceof Script) ${(script instanceof Script)}`);
    Qworum._log(`[Qworum.eval] Script ${Script}`, Script);
    if (!(script instanceof Script)) return Promise.reject(new TypeError('not a script'));
    Qworum._log(`[Qworum.eval] arg checked`);

    try {
      // make the api request
      const
      request = { apiVersion, endpoint: 'Evaluate script', body: { json: script.toJsonable() } },
      response = await this._sendRequest(request);
      // Qworum._log('[Qworum for web pages - eval] request:',request);
      if (response.status.code !== 200) 
        throw new Error(`API response was: ${response.status.code} ${response.status.message}`);

      // act based on the api response
      const action = response.body;
      Qworum._log(`[Qworum.eval] received action`,action);
      // alert(`[Qworum.eval] received action ${JSON.stringify(action)}`)
      if (action.url) {
        window.location.replace(`${action.url}`);
      } else {
        alert(`${action.message}`);
        window.close();
        // this._closeTab();
      }

      return Promise.resolve(); // execution should never reach this point
      Qworum._log(`[Qworum.eval] resolved`);

    } catch (error) {
      Qworum._log(`[Qworum.eval] error ${error}`);
      return Promise.reject(error);
    }
  }

  // /**
  //  * Closes the current tab. Used after evaluating a Qworum script that terminates a Qworum session.
  //  * 
  //  * @private
  //  * @static
  //  */
  // static _closeTab() {
  //     try {
  //         this._sendRequest(
  //             {apiVersion, endpoint: 'Close tab', body: {}}
  //         );
  //     } catch (_error) {
  //         // should not happen
  //     }
  // }

  /** 
   * Sets the value contained in a data container.
   * @static
   * @async
   * @param {(string[] | string)} path - The path of the data container.
   * @param {(Json | SemanticData)} value
   * @return {Promise<null>} Can throw a TypeError or Error.
   * @example
   * ```javascript
   * try{
   *   await Qworum.setData('year', Qworum.Json(2022));
   *   console.info('The write operation was successful.');
   * }catch(error){
   *   console.error('The write operation was not successful.');
   * }     
   * ```
   * @see {@link https://qworum.net/en/specification-v1/#data|Data container definition in the Qworum specification}
   */
  static async setData(path, value) { 
    Qworum._log(`[Qworum.setData] `);
    if (typeof path === 'string') path = [path];

    // check arguments
    if (!(this._isStringArray(path) && value instanceof DataValue)) {
      return Promise.reject(new TypeError('Invalid argument(s).'));
    }

    // call the endpoint
    try {
      const
        idbValue = value.toJsonable(),
        body     = { path, value: idbValue },
        request  = { apiVersion, endpoint: 'Set data', body },
        response = await this._sendRequest(request);

      if (response.status.code !== 200) {
        const errorMessage =
          `API error: ${response.status.code} ${response.status.message}${response.body.message ? `, ${response.body.message}` : ''}`;

        console.error(`[Qworum for web pages] error while setting data:\n  error: ${errorMessage}\n  data: ${JSON.stringify(idbValue)}`);
        return Promise.reject(new Error(errorMessage));
      }

      return Promise.resolve(null);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // TODO? add new function: static getMultipleData(paths, callback)?

  /** 
   * Reads a value contained in a data container.
   * @static
   * @async
   * @param {(string[] | string)} path - The path of the data container.
   * @return {Promise<(Json | SemanticData | null)>} - The value in the data container, or null if the value is not set. Can throw a TypeError or Error.
   * @example
   * ```javascript
   * try{
   *   const result = await Qworum.getData(['a data']);
   *   if (result instanceof Json){
   *     console.info(`The read operation was successful, the result is: ${JSON.stringify(result.value)}`);
   *   } else {
   *     console.info(`The data has not been set yet. Did you call Qworum.getData(['a data']) beforehand ?`);
   *   }
   * }catch(error){
   *   console.error('An unexpected error has occurred during the read.');
   * }
   * ```
   * @see {@link https://qworum.net/en/specification-v1/#data|Data container definition in the Qworum specification}
   */
  static async getData(path) {
    Qworum._log(`[Qworum.getData] `);
    if (typeof path === 'string') path = [path];

    // check the argument
    if (!(this._isStringArray(path))) {
      return Promise.reject(new TypeError('Invalid argument.'));
    }

    // call the endpoint
    try {
      const
        request = { apiVersion, endpoint: 'Get data', body: { path } },
        response = await this._sendRequest(request);

      if (response.status.code !== 200) {
        if (response.status.code === 404) {
          // data not found
          return Promise.resolve(null);
        } else {
          const errorMessage =
            `API error: ${response.status.code} ${response.status.message}${response.body.message ? `, ${response.body.message}` : ''}`;

          // console.error(`[Qworum for web pages] error while getting data: ${errorMessage}`);
          return Promise.reject(new Error(errorMessage));
        }
      }

      return Promise.resolve(
        DataValue.fromJsonable(response.body.value)
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  //  * If a persona isn't set yet for the session, then the user is redirected to
  //  * a built-in Qworum service to choose one.
  //  * 
  //  * The default Qworum object name used for calling
  //  * the built-in Qworum service is "user". The default return path is the current path,
  //  * whether a {@link Fault} was raised or not.
  //  * 

  /**
   * Returns the {@link Persona} that is tied to the current Qworum session.
   * 
   * If a persona isn't set yet for the session, then the web browser 
   * interacts with the end-user for setting a persona for the session.
   * 
   * @returns {Promise<(Persona|null)>}
   * @throws {Error}
   */
  static async getPersona(){
    Qworum._log(`[Qworum.getPersona] `);

    // ►► call the browser extension to read the session persona
    try {
      let 
      request  = { apiVersion, endpoint: 'Get persona for session', body: {useNewTab: true} },
      response = await Qworum._sendRequest(request);

      // ◀︎ return persona if it's already set
      if (response.status.code === 200) {
        // ◀︎ return persona or launch the browser's user dialog to select a persona for the session
        const
        personaSd = SemanticData.fromJsonable(response.body.value),
        persona   = Persona.readFrom(personaSd.value);

        return persona;

      // if persona is not set yet, then wait for the login dialog to finish and check again
      } else if (response.status.code === 404) {
        return new Promise((resolve, reject) => {
          const 
          retryReadingPersona = async event => {
            Qworum._log(`[Qworum.getPersona retryReadingPersona] `);
  
            // the Qworum extension has launched a new tab for login; 
            // wait until the current tab is in the foreground once again
            if (document.hidden) return;
            Qworum._log(`[Qworum.getPersona retryReadingPersona] visible again`);
  
            // run the rest of this event handler only once
            document.removeEventListener('visibilitychange', retryReadingPersona);
            
            // try reading the session persona once again
            request.body.isRetry = true;
            response = await Qworum._sendRequest(request);
            
            // persona still not set;
            // the end-user still has a chance to set the persona by refreshing the page
            if(response.status.code !== 200){
              // reject(new Error('the end-user has not set the session persona'));
              return resolve(null);
            }
            Qworum._log(`[Qworum.getPersona retryReadingPersona] persona set`);
        
            // persona set; return it
            const
            personaSd = SemanticData.fromJsonable(response.body.value),
            persona   = Persona.readFrom(personaSd.value);
            Qworum._log(`[Qworum.getPersona retryReadingPersona] persona:`,persona);
            return resolve(persona);
          }
  
          document.addEventListener('visibilitychange', retryReadingPersona);
  
        });

      } else {
        const errorMessage =
          `API error: ${response.status.code} ${response.status.message}${response.body.message ? `, ${response.body.message}` : ''}`;

        // console.error(`[Qworum for web pages] error while getting data: ${errorMessage}`);
        throw new Error(errorMessage);
        // return reject(new Error(errorMessage));
      }

    } catch (error) {
      throw new Error(`${error}`);
    }

  }


  // /**
  //  * Shows the session persona to the end-user.
  //  * 
  //  * @returns {Promise<void>}
  //  */
  // static async viewPersona(){
  //   const
  //   request  = { apiVersion, endpoint: 'View session persona', body: {useNewTab: true} };

  //   await Qworum._sendRequest(request);
  // }

  // /**
  //  * Returns the {@link Persona} that is tied to the current Qworum session.
  //  * If a persona isn't set yet for the session, then the user is redirected to
  //  * a built-in Qworum service to choose one.
  //  * 
  //  * The default Qworum object name used for calling
  //  * the built-in Qworum service is "user". The default return path is the current path,
  //  * whether a {@link Fault} was raised or not.
  //  * 
  //  * Users can create Qworum accounts during this call if required.
  //  * 
  //  * @param {{nameOfQworumObject: string | undefined, returnPathIfCancelledByUser: string | undefined, returnPathIfPersonaNewlySet: string | undefined, returnPathIfUnexpectedError: string | undefined} | undefined} options
  //  * @returns {Promise<(Persona|null)>}
  //  * @throws {TypeError}
  //  */
  // static async getPersona(options){
  //   Qworum._log(`[Qworum.getPersona] `);

  //   // ► read the call argument
  //   const 
  //   isObject = o => o !== null && typeof o === 'object' && !(o instanceof Array),
  //   isString = o => typeof a === 'string';

  //   if (!(options === undefined || isObject(options))) {
  //     throw new TypeError('unexpected options');
  //   }
  //   if(!options)options = {};

  //   if (!(
  //     (options.nameOfQworumObject === undefined || isString(options.nameOfQworumObject)) &&
  //     (options.returnPathIfCancelledByUser === undefined || isString(options.returnPathIfCancelledByUser)) &&
  //     (options.returnPathIfPersonaNewlySet === undefined || isString(options.returnPathIfPersonaNewlySet)) &&
  //     (options.returnPathIfUnexpectedError === undefined || isString(options.returnPathIfUnexpectedError))
  //   )) {
  //     throw new TypeError('unexpected options property or properties');
  //   }
  //   const
  //   nameOfQworumObject = options.nameOfQworumObject ?? 'user',
  //   returnPath         = {
  //     ifCancelledByUser: options.returnPathIfCancelledByUser ?? null,
  //     ifPersonaNewlySet: options.returnPathIfPersonaNewlySet ?? null,
  //     ifUnexpectedError: options.returnPathIfUnexpectedError ?? null,
  //   };

  //   // ►► call the browser extension to read the session persona
  //   try {
  //     const
  //     request  = { apiVersion, endpoint: 'Get persona for session', body: {} },
  //     response = await this._sendRequest(request);

  //     if (response.status.code !== 200) {
  //       if (response.status.code === 404) {
  //         // persona not found
  //         this.eval(
  //           Script.build(
  //             Sequence.build(
  //               Try.build(
  //                 Call.build(nameOfQworumObject, 'qworum://user/set-persona'),
  //                 [
  //                   {
  //                     // if the end-user has cancelled the persona-selection process ...
  //                     catch: 'cancelled by user',
  //                     // ... then come back to this page
  //                     do: Goto.build(returnPath.ifCancelledByUser)
  //                   }, {
  //                     // if an unexpected error has occurred during the call  ...
  //                     catch: 'unexpected',
  //                     // ... then come back to this page
  //                     do: Goto.build(returnPath.ifUnexpectedError)
  //                   }
  //                 ]
  //               ),
  //               // the session persona was set by the call
  //               Goto.build(returnPath.ifPersonaNewlySet) 
  //             )
  //           )
  //         )
  //         return Promise.resolve(null);
  //       } else {
  //         const errorMessage =
  //           `API error: ${response.status.code} ${response.status.message}${response.body.message ? `, ${response.body.message}` : ''}`;

  //         // console.error(`[Qworum for web pages] error while getting data: ${errorMessage}`);
  //         return Promise.reject(new Error(errorMessage));
  //       }
  //     }

  //     // ◀︎ return persona or launch the browser's user dialog to select a persona for the session
  //     const
  //     personaSd = SemanticData.fromJsonable(response.body.value),
  //     persona  = Persona.readFrom(personaSd.value);

  //     return Promise.resolve(persona);

  //   } catch (error) {
  //     return Promise.reject(error);
  //   }
  // }


  /** @ignore */
  static _sendRequest(message) {
    const browserExtensionInfo = this.getBrowserExtensionInfo();
    // Qworum._log(`Detected browser type: ${browserExtensionInfo.browserType}`);
    // this._log(`Detected browser type: ${browserExtensionInfo.browserType}`);
    // Qworum._log(`to Qworum extension's service worker: ${JSON.stringify(message)}`);
    // this._log(`to Qworum extension's service worker: ${JSON.stringify(message)}`);

    return new Promise((resolve, reject) => {
      try {
        if (browserExtensionInfo.browserType === 'chrome') {
          // TODO use async version of chrome.runtime.sendMessage by omitting the callback (https://developer.chrome.com/docs/extensions/reference/runtime/#method-sendMessage)
          chrome.runtime.sendMessage(
            browserExtensionInfo.extensionIds[0],
            message,

            (response) => {
              if (response) {
                resolve(response); return;
              }
              // official Qworum extension not available on browser; try the test version.
              chrome.runtime.sendMessage(
                browserExtensionInfo.extensionIds[1],
                message,

                (response) => {
                  if (response) {
                    resolve(response); return;
                  }
                  reject(new Error('The Qworum extension is not installed or is disabled.'));
                }
              );
            }
          );
        } else {
          reject(new Error('Unsupported browser.')); return;
        }
      } catch (error) {
        this._log('The Qworum extension is not installed or is disabled.');
        reject(new Error(`${error}`));
      }
    });
  }

  // Returns a non-null value if there is a Qworum extension for this browser.
  // WARNING A non-null value does not mean that 1) the Qworum extension is installed on this browser, or that 2) the browser extension is enabled for this website in the extension manifest !!!
  /** @ignore */
  static getBrowserExtensionInfo() {
    let browserExtensionInfo = null;
    if (!navigator.userAgent.includes('Chrome')) {
      browserExtensionInfo = {
        browserType: 'safari',
        extensionIds: [
          // published version (available on App Store)
          'FDC7136B-3837-47D7-90ED-F9E08C6A83B2',

          // local version for testing
          'FDC7136B-3837-47D7-90ED-F9E08C6A83B2'
        ]
      };
    } else {
      // this browser is compatible with Chrome Web Store
      browserExtensionInfo = {
        browserType: 'chrome',
        extensionIds: [
          // published version (available on Chrome Web Store)
          'leaofcglebjeebmnmlapbnfbjgfiaokg',

          // local version for testing
          // https://developer.chrome.com/docs/extensions/reference/manifest/key
          'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk5rm+vXKiWNOnfQxVRc/4hDkdpQEdbiqeQGPNZ7HqhLcGN6+Rob+zkExAvBLO8aGW9FMOJtilnbsB7ManJBVmlVGivQoMqdJKhbYKt3/wBUuNhW1o+u+YcQhRJnN/L65unzAOCubXAdfoHp/rTjw2xoW2PfYdefIdlY2hBORGFstN6qDsZoYZa9QBasJ7ptWb2kuL9gKVxHWSQZUElDggl2KaxoE0LqQQYPdtqV3/amuRlKzDRgVJ6RDRezgeoegndYcoTF5q5F28kr3SPfEU8M9xxf5syHr8JZxv+HS+dTmIMybdixSIV9RH8EX8ZVsPdNy08eHy35lkpDn+2lvaQIDAQAB'
        ]
      };
    }
    if (!browserExtensionInfo) throw new Error('[Qworum for web pages] Browser not supported.');
    // this._log(`extension info: ${JSON.stringify(browserExtensionInfo)}`);
    return browserExtensionInfo;
  }

  // WARNING Don't use the @private tag in the jsdoc comments for the constructor,
  // otherwise this class will be omitted from the generated docs.
  /**
   * The constructor is not used, as all methods and properties are static.
   * @ignore
   */
  constructor() { }

  // utility functions ///////////////////////////////////////////

  /** @ignore */
  static _isStringArray(value) {
    return (
      value instanceof Array &&
      value.reduce(
        (total, current) => total && typeof current == 'string',
        true
      )
    );
  }

  /** @ignore */
  static _log(message) {
    console.info(`[Qworum for web pages] ${message}`);
  }
}

export { Qworum };
