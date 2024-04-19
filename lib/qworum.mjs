/**
 * Qworum for web pages. This ES JavaScript library exports the Qworum class.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * @see <https://qworum.net>
 */

import {
  SemanticData, Json, DataValue,
  PlatformFault, Fault,
  FaultTypeError, PlatformFaultTypeError,
  Script, Call, Goto, Try, Data, Sequence, Return, 
  Instruction, GenericData,  
} from "./qworum-script.mjs";



/**
 * Web pages can use the Qworum capabilities of web browsers through this JavaScript class.
 * 
 * These are the main methods that Web pages use:
 * 
 * - <code>[Qworum.eval()](#method_eval_0)</code> evaluates a Qworum script.
 * - <code>[Qworum.setData()](#method_setData_0)</code> sets the value of a data container.
 * - <code>[Qworum.getData()](#method_getData_0)</code> reads the value of a data container.
 * 
 * <code>Qworum.eval()</code> receives a Qworum script as argument. Here are the methods for generating a Qworum script from in-page JavaScript:
 * 
 * - <code>[Qworum.Script()](#property_Script)</code> creates a Qworum script.
 * - <code>[Qworum.Call()](#property_Call)</code>, <code>[Qworum.Goto()](#property_Goto)</code>, <code>[Qworum.Return()](#property_Return)</code>, <code>[Qworum.Sequence()](#property_Sequence)</code>, <code>[Qworum.Fault()](#property_Fault)</code>, <code>[Qworum.Try()](#property_Try)</code> and <code>[Qworum.Data()](#property_Data)</code> create instructions.
 * - <code>[Qworum.Json()](#property_Json)</code> and <code>[Qworum.SemanticData()](#property_SemanticData)</code> create data values.
 * 
 * Other methods:
 * 
 * - <code>[Qworum.checkAvailability()](#method_checkAvailability_0)</code> verifies that a website can use the Qworum capabilities of browsers.
 * 
 * _Note: The 📝 sign indicates a function that is used for generating Qworum scripts._
 * 
 * @example Checking the browser's Qworum availability status.
 * 
 * try{
 *   await Qworum.checkAvailability();
 * }catch(error){
 *   console.error('Qworum browser extension not installed or not enabled.');
 * }     
 * 
 * @example An online shop calls a remote shopping cart service.
 * 
 * await Qworum.eval(
 *   Qworum.Script(
 *     Qworum.Sequence(
 *       Qworum.Call(["@", "shopping cart"], "https://shopping-cart.example/view/"),
 *       Qworum.Goto("/home/")
 *     )
 *   )
 * );
 * 
 * @example Storing data in the current Qworum method call.
 * 
 * await Qworum.setData('year', Qworum.Json(2024));
 * 
 * @example Reading data stored in the current Qworum method call.
 * 
 * const result = await Qworum.getData(['year']);
 * console.info(JSON.stringify(result.value));
 * 
 * @example Catching Qworum faults with a `try` instruction in a Qworum script.
 * 
 * Qworum.Try(
 *   Qworum.Call('@', 'checkout/'), 
 *   [
 *     {catch: ['* the cart is empty'], do: Json({})}
 *   ]
 * )
 * 
 * @example A Qworum fault in a Qworum script (raises a fault when evaluated in a Qworum script).
 * 
 * Qworum.Fault('* payment cancelled')
 * 
 */
class Qworum {

  /** 
   * Checks that:
   * 
   * - the Qworum browser extension is installed and running, and
   * - the website's [origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) is part of Qworum's Service Web.
   * @static
   * @async
   * @return {Promise.<null>} Can throw an Error.
   * @example
   * try{
   *   await Qworum.checkAvailability();
   * }catch(error){
   *   console.error('Qworum browser extension not installed or not enabled.');
   * }     
   */
  static async checkAvailability() {
    try {
      const
        request = { apiVersion, endpoint: 'Check Qworum availability', body: {} },
        response = await this._sendRequest(request);

      if (response.status.code !== 200) {
        return Promise.reject(new Error('Internal error'));
      }
      return Promise.resolve(null);
    } catch (error) {
      return Promise.reject(new Error('Writing was not successful'));
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
   * @return {Promise.<void>} Can throw a TypeError or Error.
   * @example
   * const
   * Script = Qworum.Script,
   * Goto   = Qworum.Goto;
   * 
   * await Qworum.eval(
   *   Script(
   *     Goto('next-phase/')
   *   )
   * );
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#script)
   */
  static async eval(script) {
    if (!(script instanceof Script)) return Promise.reject(new TypeError('not a script'));

    try {
      // make the api request
      const
      request = { apiVersion, endpoint: 'Evaluate script', body: { json: script.toJsonable() } },
      response = await this._sendRequest(request);
      // console.debug('[Qworum for web pages - eval] request:',request);
      if (response.status.code !== 200) {
        return Promise.reject(new Error(`API response was: ${response.status.code} ${response.status.message}`));
      }

      // act based on the api response
      const action = response.body;
      if (action.url) {
        window.location.replace(`${action.url}`);
      } else {
        alert(`${action.message}`);
        window.close();
        // this._closeTab();
      }

      return Promise.resolve(); // execution should never reach this point

    } catch (error) {
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
   * @return {Promise.<null>} Can throw a TypeError or Error.
   * @example
   * try{
   *   await Qworum.setData('year', Qworum.Json(2022));
   *   console.info('The write operation was successful.');
   * }catch(error){
   *   console.error('The write operation was not successful.');
   * }     
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#data)
   */
  static async setData(path, value) { 
    Qworum._log(`[setData] `);
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
   * @return {Promise.<(Json | SemanticData | null)>} - The value in the data container, or null if the value is not set. Can throw a TypeError or Error.
   * @example
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
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#data)
   */
  static async getData(path) {
    Qworum._log(`[getData] `);
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

          console.error(`[Qworum for web pages] error while getting data: ${errorMessage}`);
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

  /** @ignore */
  static _sendRequest(message) {
    const browserExtensionInfo = this.getBrowserExtensionInfo();
    this._log(`Detected browser type: ${browserExtensionInfo.browserType}`);
    this._log(`to Qworum extension's service worker: ${JSON.stringify(message)}`);

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
    this._log(`extension info: ${JSON.stringify(browserExtensionInfo)}`);
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
    // console.info(`[Qworum for web pages] ${message}`);
  }
}

export { Qworum };
