/**
 * Web applications can use the Qworum capabilities of web browsers through this class.
 *
 * #### Methods for manipulating the Qworum sessions of browser tabs:
 *
 * - ▶︎ [Qworum.eval()](#.eval) evaluates a Qworum script.
 * - ▶︎ [Qworum.setData()](#.setData) sets the value of a data container.
 * - ▶︎ [Qworum.getData()](#.getData) reads the value of a data container.
 *
 * #### Methods for generating Qworum scripts that are passed as call arguments to Qworum.eval():
 *
 * - ▶︎ [Qworum.Script()](#.Script) creates a Qworum script.
 * - ▶︎ [Qworum.Call()](#.Call), [Qworum.Goto()](#.Goto), [Qworum.Return()](#.Return), [Qworum.Sequence()](#.Sequence), [Qworum.Fault()](#.Fault), [Qworum.Try()](#.Try) and [Qworum.Data()](#.Data) create instructions.
 * - ▶︎ [Qworum.Json()](#.Json) and [Qworum.SemanticData()](#.SemanticData) create data values.
 *
 * #### Other methods:
 *
 * - ▶︎ [Qworum.checkAvailability()](#.checkAvailability) verifies that a website can use the Qworum capabilities of browsers.
 *
 * _Note:_ The 📝 sign indicates a function that is used for generating Qworum scripts,
 * and the 🚀 sign is for functions that call the Qworum browser extension.
 */
export class Qworum {
    /**
     * The version of this JavaScript library.
     * @static
     * @type {string}
     */
    static version: string;
    /**
     * A static array containing the Qworum instruction and data classes.
     * @static
     * @type {Array}
     */
    static message: any[];
    /**
     * 📝 Builder for Qworum scripts.
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
    static Script: any;
    /**
     * 📝 Builder for Call instructions.
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
    static Call: any;
    /** Builder function for Return instructions. */
    /**
     * 📝 Builder for Goto instructions.
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
    static Goto: any;
    /**
     * 📝 Builder for Return instructions.
     * @function Qworum.Return
     * @static
     * @param {(Qworum.message.DataValue | Qworum.message.Instruction)} statement - The instruction or data value to evaluate.
     * @throws {Error}
     * @returns {Qworum.message.Return}
     * @example
     * const return1 = Qworum.Return(Qworum.Json(2022));
     * @see [Qworum specification](https://qworum.net/en/specification/v1/#return)
     */
    static Return: any;
    /**
     * 📝 Builder for Sequence instructions.
     * @function Qworum.Sequence
     * @static
     * @param {(Qworum.message.DataValue | Qworum.message.Instruction | Array.<(Qworum.message.DataValue | Qworum.message.Instruction)>)} statements - Statements.
     * @throws {Error}
     * @returns {Qworum.message.Sequence}
     * @example
     * const sequence = Qworum.Sequence(Qworum.Json(2022));
     * @see [Qworum specification](https://qworum.net/en/specification/v1/#sequence)
     */
    static Sequence: any;
    /**
     * 📝 Builder for Fault instructions. Suitable for service-specific faults only.
     * @function Qworum.Fault
     * @static
     * @param {(string | undefined)} type - The type of the raised fault.
     * @throws {Qworum.message.FaultTypeError}
     * @returns {Qworum.message.Fault}
     * @example
     * const fault = Qworum.Fault('* payment cancelled');
     * @see [Qworum specification](https://qworum.net/en/specification/v1/#fault)
     */
    static Fault: any;
    /**
     * 📝 Builder function for Try instructions.
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
    static Try: any;
    /**
     * 📝 Builder for Data instructions.
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
    static Data: any;
    /**
     * 📝 Builder for Json data values.
     * @function Qworum.Json
     * @static
     * @param value - A value that can be serialized to JSON.
     * @throws {Error}
     * @returns {Qworum.message.Json}
     * @example
     * const json = Qworum.Json(2022);
     * @see [Qworum specification](https://qworum.net/en/specification/v1/#json)
     */
    static Json: any;
    /**
     * 📝 Builder for semantic data values.
     * @function Qworum.SemanticData
     * @static
     * @param {string} value - The semantic data value.
     * @param {(string | undefined)} type - The type of the semantic data value. One of 'json-ld', 'n-quads'.
     * @throws {Error}
     * @returns {Qworum.message.SemanticData}
     * @example
     * const json = Qworum.SemanticData(`{
     *   "@context"  : {"@vocab": "https://schema.org/"},
     *   "@id"       : "https://www.wikidata.org/wiki/Q92760",
     *   "@type"     : "Person",
     *   "givenName" : "Claude",
     *   "familyName": "Shannon",
     *   "birthDate" : "1916-04-30"
     * }`);
     * @see [Qworum specification](https://qworum.net/en/specification/v1/#semantic)
     */
    static SemanticData: any;
    /**
     * 🚀 Checks that:
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
    static checkAvailability(): Promise<null>;
    /**
     * 🚀 Evaluates a Qworum script.
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
    static eval(script: Qworum.message.Script): Promise<void>;
    /**
     * 🚀 Sets the value contained in a data container.
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
    static setData(path: (string[] | string), value: (Qworum.message.Json | Qworum.message.SemanticData)): Promise<null>;
    /**
     * 🚀 Reads a value contained in a data container.
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
    static getData(path: (string[] | string)): Promise<(Qworum.message.Json | Qworum.message.SemanticData | null)>;
    static _sendRequest(message: any): any;
    static getBrowserExtensionInfo(): {
        browserType: string;
        extensionIds: string[];
    };
    static _isStringArray(value: any): any;
    static _log(message: any): void;
}
