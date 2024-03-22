/**
 * Qworum for web pages. This ES JavaScript library exports the Qworum class.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license Apache-2.0 <https://www.apache.org/licenses/LICENSE-2.0>
 * @see <https://qworum.net>
 */

import {
  PhaseParameters, Script, Call, Goto, Try, Data, Sequence, Return, PlatformFault, PlatformFaultTypeError, Fault,
  FaultTypeError, Instruction, SemanticData, Json, GenericData, DataValue,
} from "./qworum-script.mjs";


// end qworum-messages-*.mjs


/*
 * An order to redirect to a new URL. Such orders can be sent by the Qworum browser extension
 * after evaluating a Qworum script.
 */
class QworumRequest {
  url;
  static build(url) {
    if (!(url instanceof URL)) throw new Error('wrong phase parameters arguments');
    return new QworumRequest(url);
  }
  constructor(url) {
    this.url = url;
  }
  toString() {
    let result = `url: ${this.url}`;
    return `QworumRequest(${result})`;
  }
  toJsonable() {
    return {
      url: this.url.href
    };
  }
  static fromJsonable(jsonable) {
    return QworumRequest.build(new URL(jsonable.url));
  }
}

/*
 * The version of the Qworum browser extension API that this JavaScript library uses.
 */
const apiVersion = '1.0';

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
class Qworum { // TODO remove script-related pointers, use QworumScript instead
  /** 
   * Classes representing Qworum instructions and Qworum data. 
   * @static
   * @type {Object.<string, Class>}
   */
  static message = {
    PhaseParameters, Script, Call, Goto, Try, Data, Sequence, Return, PlatformFault, PlatformFaultTypeError, Fault,
    FaultTypeError, Instruction, SemanticData, Json, GenericData, DataValue,
  };

  /** 
   * 📝 Builder for [Qworum scripts](https://qworum.net/en/specification/v1/#script). 
   * @function Qworum.Script
   * @static
   * @param {Qworum.message.Instruction} instruction - The instruction to execute.
   * @returns {Qworum.message.Script}
   * @example
   * const script = 
   * Qworum.Script(
   *   Qworum.Sequence(
   *     // Show the user's shopping cart
   *     Qworum.Call(["@", "shopping cart"], "https://shopping-cart.example/view/")
   * 
   *     // Go back to the current e-shop
   *     Qworum.Goto("/home/")
   *   )
   * );
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#script)
   */
  static Script = Qworum.message.Script.build;

  /** 
   * 📝 Builder for [Call instructions](https://qworum.net/en/specification/v1/#call). 
   * @function Qworum.Call
   * @static
   * @param {(string[] | string | null | undefined)} object - The path of the Qworum object to call.
   * @param {(string | null | undefined)} href - The URL of the end-point to call. Can be a relative or absolute URL.
   * @param {(object | object[] | null | undefined)} arguments - Named data value arguments.
   * @param {(object | object[] | null | undefined)} objectArguments - Named Qworum object arguments.
   * @throws {Error}
   * @returns {Qworum.message.Call}
   * @example
   * // Example 1
   * const call1 = Qworum.Call('@', 'home/');
   * // Example 2
   * const call2 = Qworum.Call(
   *   '@', 'home/', 
   *   {name: 'current year', value: Qworum.Json(2022)}
   * );
   * // Example 3
   * const call3 = Qworum.Call(
   *   ['@'], 'home/',
   *   [{name: 'current year', value: Qworum.Json(2022)}],
   *   [{name: , object: ['@', 'a Qworum object']}]
   * );
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#call)
   */
  static Call = Qworum.message.Call.build;

  /** Builder function for Return instructions. */

  /** 
   * 📝 Builder for [Goto instructions](https://qworum.net/en/specification/v1/#goto). 
   * @function Qworum.Goto
   * @static
   * @param {(string | null | undefined)} href - The URL of the end-point to call. Can be a relative or absolute URL.
   * @throws {Error}
   * @returns {Qworum.message.Goto}
   * @example
   * const goto = Qworum.Goto(
   *   ['@'], 'home/'
   * );
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#goto)
   */
  static Goto = Qworum.message.Goto.build;

  /** 
   * 📝 Builder for [Return instructions](https://qworum.net/en/specification/v1/#return). 
   * @function Qworum.Return
   * @static
   * @param {(Qworum.message.DataValue | Qworum.message.Instruction)} statement - The instruction or data value to evaluate.
   * @throws {Error}
   * @returns {Qworum.message.Return}
   * @example
   * const return1 = Qworum.Return(Qworum.Json(2022));
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#return)
   */
  static Return = Qworum.message.Return.build;

  /** 
   * 📝 Builder for [Sequence instructions](https://qworum.net/en/specification/v1/#sequence). 
   * @function Qworum.Sequence
   * @static
   * @param {(Qworum.message.DataValue | Qworum.message.Instruction | Array.<(Qworum.message.DataValue | Qworum.message.Instruction)>)} statements - Statements.
   * @throws {Error}
   * @returns {Qworum.message.Sequence}
   * @example
   * const sequence = Qworum.Sequence(Qworum.Json(2022));
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#sequence)
   */
  static Sequence = Qworum.message.Sequence.build;

  /** 
   * 📝 Builder for [Fault instructions](https://qworum.net/en/specification/v1/#fault). Suitable for service-specific faults only.
   * @function Qworum.Fault
   * @static
   * @param {(string | undefined)} type - The type of the raised fault.
   * @throws {Qworum.message.FaultTypeError}
   * @returns {Qworum.message.Fault}
   * @example
   * const fault = Qworum.Fault('* payment cancelled');
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#fault)
   */
  static Fault = Qworum.message.Fault.build;

  /** 
   * 📝 Builder function for [Try instructions](https://qworum.net/en/specification/v1/#try).
   * @function Qworum.Try
   * @static
   * @param statement - A statement (instruction or data value) or a non-empty array of statements.
   * @param catchClauses - One catch clause or an array of catch clauses.
   * @throws {Error}
   * @returns {Qworum.message.Try} 
   * @example
   * const try1 = Qworum.Try(
   *   Qworum.Call('@', 'checkout/'), 
   *   [
   *     {catch: ['* the cart is empty'], do: Json({})}
   *   ]
   * );
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#try)
   */
  static Try = Qworum.message.Try.build;

  /** 
   * 📝 Builder for [Data instructions](https://qworum.net/en/specification/v1/#data). 
   * @function Qworum.Data
   * @static
   * @param {(string | string[])} path - The path of the data container.
   * @param {(Qworum.message.DataValue | Qworum.message.Instruction | undefined)} statement - An instruction or data value.
   * @throws {Error}
   * @returns {Qworum.message.Data}
   * @example
   * const
   * // Instruction for setting the value of a data container
   * data1 = Qworum.Data('data1', Qworum.Json(2022)),
   * // Instruction for reading the value of the data container
   * data2 = Qworum.Data('data1');
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#data)
   */
  static Data = Qworum.message.Data.build;

  /** 
   * 📝 Builder for [Json data values](https://qworum.net/en/specification/v1/#json). 
   * @function Qworum.Json
   * @static
   * @param value - A value that can be serialized to JSON.
   * @throws {Error}
   * @returns {Qworum.message.Json}
   * @example
   * const json = Qworum.Json(2022);
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#json)
   */
  static Json = Qworum.message.Json.build;

  /** 
   * 📝 Async builder for [semantic data values](https://qworum.net/en/specification/v1/#semantic). 
   * @function Qworum.SemanticData
   * @static
   * @param {string} value - The semantic data value.
   * @param {(string | undefined)} type - The type of the semantic data value. One of 'turtle', 'trig', 'n-triples', 'n-quads'. Default is 'turtle'.
   * @throws {Error}
   * @returns {Qworum.message.SemanticData}
   * @see [Qworum specification](https://qworum.net/en/specification/v1/#semantic)
   */
  static SemanticData = Qworum.message.SemanticData.build;

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
   * @param {Qworum.message.Script} script
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
    if (!(script instanceof Qworum.message.Script)) return Promise.reject(new TypeError('not a script'));

    try {
      // make the api request
      const
        request = { apiVersion, endpoint: 'Evaluate script', body: { xml: script.toXml() } },
        response = await this._sendRequest(request);
      // console.debug('[Qworum for web pages - eval] request:',request);
      if (response.status.code !== 200) {
        return Promise.reject(new Error(`API response was: ${response.status.code} ${response.status.message}`));
      }

      // parse the api response
      let action;
      if (response.body.webRequest) {
        // QworumRequest
        action = QworumRequest.fromJsonable(response.body.webRequest);
      } else if (response.body.data) {
        // Json or SemanticData
        action = DataValue.fromIndexedDb(response.body.data);
        if (!(action instanceof Json || action instanceof SemanticData)) {
          return Promise.reject(new TypeError('received unknown data type'));
        }
      } else { // response.body.fault
        // Fault or PlatformFault
        try {
          action = Fault.fromIndexedDb(response.body.fault);
        } catch (_error) {
          try {
            action = PlatformFault.fromIndexedDb(response.body.fault);
          } catch (_error) {
            // unparsable data
          }
        }
      }
      if (!action) return Promise.reject(new Error('unparsable action'));

      // act based on the api response
      if (action instanceof QworumRequest) {
        window.location.replace(`${action.url}`);
      } else {
        alert(`${action}`);
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
   * @param {(Qworum.message.Json | Qworum.message.SemanticData)} value
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
        body = { path, value: value.toIndexedDb() },
        request = { apiVersion, endpoint: 'Set data', body },
        response = await this._sendRequest(request);

      if (response.status.code !== 200) {
        const errorMessage =
          `API error: ${response.status.code} ${response.status.message}${response.body.message ? `, ${response.body.message}` : ''}`;

        console.error(`[Qworum for web pages] error while setting data: ${errorMessage}`);
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
   * @return {Promise.<(Qworum.message.Json | Qworum.message.SemanticData | null)>} - The value in the data container, or null if the value is not set. Can throw a TypeError or Error.
   * @example
   * try{
   *   const result = await Qworum.getData(['a data']);
   *   if (result instanceof Qworum.message.Json){
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
        DataValue.fromIndexedDb(response.body.value)
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
          'iboekogiiknedkbpoohiaiejdjjbkaae'
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
