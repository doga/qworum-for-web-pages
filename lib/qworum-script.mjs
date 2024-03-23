import { N3 } from "../imports.mjs";
import {
  XmlNamespaceStack, XmlDocument, XmlElement, XmlProcessingInstruction, XmlCdata, XmlComment, XmlText, XmlNode,
  Parser, Writer,
} from "./xml.mjs";

// Cross-browser JavaScript module for web pages.
// Used for communicating with the browser's Qworum extension.
// (I will make this available on GitHub.)
// 
// How it works: see https://developer.chrome.com/docs/extensions/mv3/messaging/#external-webpage

// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

class DataValue {
  static registry = [];
  toString() {
    throw new Error('not implemented');
  }
  static fromXmlElement(element, namespaceStack) {
    let errorMessage = 'Not valid data';
    for (const dataType of DataValue.registry) {
      try {
        const data = dataType.fromXmlElement(element, namespaceStack);
        return data;
      } catch (error) {
        errorMessage = `${error}`;
      }
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    throw new Error('not implemented');
  }
  static fromIndexedDb(encodedData) {
    let errorMessage = 'Not valid data';
    for (const dataType of DataValue.registry) {
      try {
        const data = dataType.fromIndexedDb(encodedData);
        return data;
      } catch (error) { }
    }
    throw new Error(errorMessage);
  }
  toIndexedDb() {
    throw new Error('not implemented');
  }
}
class GenericData extends DataValue {
  static namespace = new URL('https://qworum.net/ns/v1/data/');
  toString() {
    throw new Error('not implemented');
  }
  static fromXmlElement(element, namespaceStack) {
    let errorMessage = 'Not valid data';
    for (const dataType of GenericData.registry) {
      try {
        const data = dataType.fromXmlElement(element, namespaceStack);
        return data;
      } catch (error) { }
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    throw new Error('not implemented');
  }
  static fromIndexedDb(encodedData) {
    let errorMessage = 'Not valid data';
    for (const dataType of GenericData.registry) {
      try {
        const data = dataType.fromIndexedDb(encodedData);
        return data;
      } catch (error) { }
    }
    throw new Error(errorMessage);
  }
  toIndexedDb() {
    throw new Error('not implemented');
  }
}

class Json extends GenericData {
  static tag = 'json';
  _value;
  static build(value) {
    return new Json(value);
  }
  constructor(value) {
    super();
    const json = JSON.stringify(value);
    if (!json) throw new Error(`Value cannot be converted to JSON: ${value}`);
    this._value = value;
  }
  get value() {
    return this._value;
  }
  toString() {
    return `Json(${JSON.stringify(this.value)})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack || XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name);
      if (!namespace) throw new Error(`namespace is not json's`);
      if (!(new URL(namespace).href === GenericData.namespace.href && XmlNamespaceStack.getElementNameWithoutPrefix(element.name) === Json.tag)) throw 'not an int';
      let text = '';
      for (const node of element.children) {
        if (![
          XmlNode.TYPE_TEXT,
          XmlNode.TYPE_CDATA
        ].includes(node.type)) continue;
        text += node.text;
      }
      try {
        const value = JSON.parse(text);
        result = new Json(value);
      } catch (error) {
        throw new Error(`String is not valid JSON: "${text}"`);
      }
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Json) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = GenericData.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'd'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [
      new XmlText(JSON.stringify(this.value))
    ], name = XmlNamespaceStack.elementName(Json.tag, prefix), element = new XmlElement(name, attributes, children);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    return element;
  }
  static fromIndexedDb(encodedData) {
    if (!(encodedData && typeof encodedData === 'object' && !Array.isArray(encodedData) && encodedData.type === `${Json.namespace} ${Json.tag}`)) throw new Error('wrong IndexedDB object');
    return new Json(encodedData.value);
  }
  toIndexedDb() {
    return {
      type: `${Json.namespace} ${Json.tag}`,
      value: this.value
    };
  }
}
class SemanticData extends GenericData {
  static tag = 'semantic';
  _value; // N3.Store
  _prefixes;

  static build() {
    return new SemanticData();
  }
  constructor() {
    super();
    // if (!SemanticData.dataTypes.includes(type)) throw new TypeError(`Unknown semantic data type`);
    // if (!(value instanceof N3.Store)) throw new TypeError(`Value is not a store`);
    this._value = new N3.Store();
    this._prefixes = {};
  }
  get value() {
    return this._value;
  }
  get prefixes() {
    return this._prefixes;
  }
  addPrefixes(prefixes){
    if(!(typeof prefixes === 'object'))return;
    for (const prefix of Object.keys(prefixes)) {
      this.prefixes[prefix] = prefixes[prefix];
    }
  }

  /**
   * @param {string} text - RDF data in one of these formats: Turtle, TriG, N-Triples, N-Quads
   * @param {(URL|undefined)} baseIRI - The URL of the RDF document
   * @throws {(TypeError|Error)}
   * @returns {boolean}
   */
  async readFromText(text, baseIRI){ // BUG async?
    return new Promise((resolve, reject) => {
      if (typeof text !== 'string') {
        reject(new TypeError(`not a text`)); return;
      }
      if(baseIRI && !(baseIRI instanceof URL)) {
        reject(new TypeError(`not an IRI`)); return;
      }
      // type
      // if (!type || type.trim().length == 0) {
      //   type = SemanticData.dataTypes[0];
      // }
      // if (!SemanticData.dataTypes.includes(type)) {
      //   reject(new Error('Unknown semantic data type'));
      //   return;
      // }
      // value
      // if (typeof text !== 'string') {
      //   reject(new Error('Bad semantic data value'));
      //   return;
      // }
      let parsingError;
      const
      store          = this.value,
      parser         = new N3.Parser(baseIRI ? {baseIRI: baseIRI.toString()} : null),
      parserCallback = (error, quad, prefixes) => {
        if (parsingError) return;
        if (error) {
          parsingError = ` ${error}`;
          reject(new Error(`Error while parsing semantic data:${parsingError}`));
          return;
        }
        if (quad) {
          // console.debug(`\nadding quad:\n${JSON.stringify(quad)}`);
          store.add(quad);
        } else {
          // console.debug(`\nfinished reading. prefixes:\n${JSON.stringify(prefixes)}\n`);
          // remember the new prefixes
          this.addPrefixes(prefixes);
          resolve(true);
        }
      };
      parser.parse(text, parserCallback);
    });
  }
  async readFromUrl(url){
      try {
        // console.debug(`Fetching: ${url}`);
        const
        response = await fetch(url),
        text     = await response.text();

        return this.readFromText(text,url);
      } catch (error) {
        Promise.reject(error);
      }
  }
  toRawString(type) {
  // async toRawString(type) {
    let format;
    if(!type){
      type = 'turtle';
    }
    switch (type) {
      case 'turtle':
        format = 'Turtle'; break;
      case 'trig':
        format = 'TriG'; break;
      case 'n-triples':
        format = 'N-Triples'; break;
      case 'n-quads':
        format = 'N-Quads'; break;
      default:
        throw new TypeError('not an rdf format name');
        // return Promise.reject(new TypeError('not an rdf format name'));
    }
    let result, error;
    // return new Promise((resolve, reject) => {
      const writer = new N3.Writer({ prefixes: this.prefixes, format });
      for (const quad of this.value) writer.addQuad(quad);
      writer.end((err, res) => {
        if (err) {
          error = new Error(`Error while writing ${format}: ${err}`);
          // reject(new Error(`Error while writing ${format}: ${err}`));
        } else {
          result = res;
          // resolve(result);
        }
      });
    // });
    if(error)throw error;
    return result;
  }
  toString() {
  // async toString() {
    const res = this.toRawString().split('\n').map(line => `  ${line}`).join('\n');
    // const res = await this.toRawString();
    // Promise.resolve(`SemanticData(${res})`);
    return `SemanticData(\n${res}\n)`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack || XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name);
      if (!namespace) throw new Error(`data has no namespace`);
      if (!(new URL(namespace).href === GenericData.namespace.href)) throw 'bad data namespace';
      if (!(XmlNamespaceStack.getElementNameWithoutPrefix(element.name) === SemanticData.tag)) throw 'bad data element tag';
      let text = '';
      for (const node of element.children) {
        if (![
          XmlNode.TYPE_TEXT,
          XmlNode.TYPE_CDATA
        ].includes(node.type)) continue;
        text += node.text;
      }
      const type = element.attributes['type'];
      let detectedType = SemanticData.dataTypes[0];
      if (type) {
        for (const dataType of SemanticData.dataTypes) {
          if (`${dataType}` === type) {
            detectedType = dataType;
            break;
          }
        }
      }
      result = new SemanticData(text, detectedType);
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof SemanticData) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const
      namespace = GenericData.namespace.href,
      nsStack = namespaceStack || new XmlNamespaceStack(),
      existingPrefix = nsStack.prefixFor(namespace, null),
      useNewPrefix = typeof existingPrefix !== 'string',
      newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, ['d']) : null,
      prefix = newPrefix || existingPrefix,
      attributes = Object.create(null),
      children = [new XmlText(this._toString())],
      name = XmlNamespaceStack.elementName(SemanticData.tag, prefix),
      element = new XmlElement(name, attributes, children);

    attributes['type'] = this.type;
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    return element;
  }
  static fromIndexedDb(encodedData) {
    if (!(encodedData && typeof encodedData === 'object' && !Array.isArray(encodedData) && encodedData.type === `${SemanticData.namespace} ${SemanticData.tag}` && typeof encodedData.value === 'object' && typeof encodedData.value.type === 'string' && typeof encodedData.value.text === 'string')) throw new Error('wrong IndexedDB object');
    let detectedType = SemanticData.dataTypes[0];
    for (const dataType of SemanticData.dataTypes) {
      if (`${dataType}` === encodedData.value.type) {
        detectedType = dataType;
        break;
      }
    }
    return new SemanticData(encodedData.value.text, detectedType);
  }
  toIndexedDb() {
    return {
      type: `${SemanticData.namespace} ${SemanticData.tag}`,
      value: {
        type: this.type,
        text: this._toString()
      }
    };
  }
}
DataValue.registry = [
  Json,
  SemanticData
];
class Instruction {
  static namespace = new URL('https://qworum.net/ns/v1/instruction/');
  static registry = [];
  toString() {
    throw new Error('not implemented');
  }
  static fromXmlElement(element, namespaceStack) {
    let errorMessage = 'Not valid instruction';
    for (const instructionType of Instruction.registry) {
      try {
        const instruction = instructionType.fromXmlElement(element, namespaceStack);
        return instruction;
      } catch (error) { }
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    throw new Error('not implemented');
  }
  static fromIndexedDb(encoded) {
    let errorMessage = 'Not valid instruction';
    for (const instructionType of Instruction.registry) {
      try {
        const instruction = instructionType.fromIndexedDb(encoded);
        return instruction;
      } catch (error) { }
    }
    throw new Error(errorMessage);
  }
  toIndexedDb() {
    throw new Error('not implemented');
  }
  static statementFromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    try {
      return Instruction.fromXmlElement(element, nsStack);
    } catch (error) { }
    try {
      return DataValue.fromXmlElement(element, nsStack);
    } catch (error) { }
    throw new Error('not a statement');
  }
  static statementFromIndexedDb(encodedStatement) {
    try {
      const instruction = Instruction.fromIndexedDb(encodedStatement);
      return instruction;
    } catch (error) { }
    try {
      const o = DataValue.fromIndexedDb(encodedStatement);
      return o;
    } catch (error) { }
    throw new Error('not a statement');
  }
}
class FaultTypeError extends Error {
  constructor(message) {
    super(message || 'Not a valid fault');
  }
}
class Fault extends Instruction {
  static tag = "fault";
  static entitlementTypes = [
    'entitlement',
    'service entitlement',
    'platform entitlement'
  ];
  static serviceSpecificTypes = [
    'service-specific',
    /^\*/
  ];
  static serviceTypes = [
    'service',
    'script',
    'origin',
    'data',
    'path',
    ...Fault.serviceSpecificTypes,
    ...Fault.entitlementTypes
  ];
  static userAgentTypes = [
    'user-agent',
    'runtime'
  ];
  static types = [
    Fault.serviceTypes,
    Fault.userAgentTypes
  ].flat();
  static defaultType = Fault.serviceSpecificTypes[0];
  _type;
  static build(type) {
    return new Fault(type);
  }
  constructor(type, types) {
    super();
    if (!type) type = Fault.defaultType;
    const allowedFaultTypes = types || Fault.serviceSpecificTypes;
    if (!allowedFaultTypes.find(Fault._typeMatcher(type))) throw new FaultTypeError();
    this._type = type;
  }
  static _typeMatcher(type) {
    return (typePattern) => {
      if (typeof typePattern === 'string' && typePattern === type || typePattern instanceof RegExp && type?.match(typePattern)) return true;
      return false;
    };
  }
  get type() {
    return this._type;
  }
  toString() {
    return `Fault(type: ${this.type})`;
  }
  matches(types) {
    let faultTypes = [];
    if (types) {
      if (!(types instanceof Array)) {
        faultTypes = [
          types
        ];
      } else {
        faultTypes = types;
      }
    }
    if (faultTypes.length === 0) return true;
    const matcher = Fault._typeMatcher(this.type);
    if (faultTypes.find(matcher)) return true;
    if (faultTypes.includes(Fault.entitlementTypes[0]) && Fault.entitlementTypes.find(matcher)) return true;
    if (faultTypes.includes(Fault.serviceSpecificTypes[0]) && Fault.serviceSpecificTypes.find(matcher)) return true;
    if (faultTypes.includes(Fault.serviceTypes[0]) && Fault.serviceTypes.find(matcher)) return true;
    if (faultTypes.includes(Fault.userAgentTypes[0]) && Fault.userAgentTypes.find(matcher)) return true;
    return false;
  }
  static fromXmlElement(element, namespaceStack) {
    return new Fault(Fault._typeFromXmlElement(element, namespaceStack));
  }
  static _typeFromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let type = '', errorMessage;
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`namespace is not json's`);
      if (!(new URL(namespace).href === Fault.namespace.href && tag === Fault.tag)) throw `not a ${Fault.tag}`;
      type = element.attributes.type || Fault.defaultType;
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (errorMessage) throw new Error(errorMessage);
    return type;
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Fault.tag, prefix), element = new XmlElement(name, attributes, children);
    attributes['type'] = this.type;
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Fault.tag) throw new Error(`not a ${Fault.tag}`);
    return new Fault(Fault._typeFromIndexedDb(encoded));
  }
  static _typeFromIndexedDb(encoded) {
    if (encoded.type !== Fault.tag) throw new Error(`not a ${Fault.tag}`);
    return encoded.value?.type || Fault.defaultType;
  }
  toIndexedDb() {
    return {
      type: Fault.tag,
      value: {
        type: this.type
      }
    };
  }
}
class PlatformFaultTypeError extends Error {
  constructor(message) {
    super(message || 'Not a platform fault');
  }
}
class PlatformFault extends Fault {
  static _platformFaultTypes = PlatformFault.types.filter((type) => !PlatformFault.serviceSpecificTypes.includes(type));
  constructor(type) {
    if (!(type && PlatformFault._platformFaultTypes.includes(type))) throw new PlatformFaultTypeError();
    super(type, PlatformFault.types);
  }
  static build(type) {
    return new PlatformFault(type);
  }
  get type() {
    return super.type;
  }
  toString() {
    return super.toString();
  }
  matches(types) {
    return super.matches(types);
  }
  static fromXmlElement(element, namespaceStack) {
    return new PlatformFault(Fault._typeFromXmlElement(element, namespaceStack));
  }
  toXmlElement(namespaceStack) {
    return super.toXmlElement(namespaceStack);
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Fault.tag) throw new Error(`not a ${Fault.tag}`);
    return new PlatformFault(Fault._typeFromIndexedDb(encoded));
  }
  toIndexedDb() {
    return super.toIndexedDb();
  }
}
class Return extends Instruction {
  static tag = "return";
  statement;
  static build(statement) {
    return new Return(statement);
  }
  constructor(statement) {
    super();
    if (!statement) throw new Error('statement required');
    this.statement = statement;
  }
  toString() {
    return `Return(${this.statement})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : mod.NamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = mod.NamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Return.namespace.href && tag === Return.tag)) throw `not a ${Return.tag}`;
      let statement = null;
      for (const statementElement of element.children) {
        if (!(statementElement.type === mod.Node.TYPE_ELEMENT)) continue;
        statement = Instruction.statementFromXmlElement(statementElement, nsStack);
        break;
      }
      if (statement !== null) {
        result = new Return(statement);
      }
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Return) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new mod.NamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = mod.NamespaceStack.elementName(Return.tag, prefix), element = new mod.Element(name, attributes, children);
    if (useNewPrefix) {
      attributes[mod.NamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    nsStack.push(element);
    children.push(this.statement.toXmlElement(nsStack));
    nsStack.pop();
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Return.tag) throw new Error(`not a ${Return.tag}`);
    return new Return(Instruction.statementFromIndexedDb(encoded.value.statement));
  }
  toIndexedDb() {
    return {
      type: Return.tag,
      value: {
        statement: this.statement.toIndexedDb()
      }
    };
  }
}
class Sequence extends Instruction {
  static tag = "sequence";
  _statements;
  static build(...statements) {
    return new Sequence(...statements);
  }
  constructor(...statements) {
    super();
    if (!statements) throw new Error('sequence must contain one or more statements');
    let s = [];
    if (statements instanceof Array) {
      s = statements;
    } else {
      s = [
        statements
      ];
    }
    if (s.length === 0) throw new Error('sequence must contain one or more statements');
    this._statements = s;
  }
  get statements() {
    return this._statements;
  }
  toString() {
    return `Sequence(${this.statements})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Sequence.namespace.href && tag === Sequence.tag)) throw `not a ${Sequence.tag}`;
      const statements = [];
      for (const statementElement of element.children) {
        if (!(statementElement.type === XmlNode.TYPE_ELEMENT)) continue;
        statements.push(Instruction.statementFromXmlElement(statementElement, nsStack));
      }
      if (statements.length > 0) {
        result = new Sequence(...statements);
      }
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Sequence) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Sequence.tag, prefix), element = new XmlElement(name, attributes, children);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    nsStack.push(element);
    for (const statement of this.statements) {
      children.push(statement.toXmlElement(nsStack));
    }
    nsStack.pop();
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Sequence.tag) throw new Error(`not a ${Sequence.tag}`);
    const statements = encoded.value.statements.map((encodedStatement) => Instruction.statementFromIndexedDb(encodedStatement));
    return new Sequence(...statements);
  }
  toIndexedDb() {
    return {
      type: Sequence.tag,
      value: {
        statements: this.statements.map((statement) => statement.toIndexedDb())
      }
    };
  }
}
class Data extends Instruction {
  static tag = "data";
  _path = [];
  statement = null;
  static build(path, statement) {
    return new Data(path, statement);
  }
  constructor(path, statement) {
    super();
    const p = path instanceof Array ? path : [
      path
    ];
    if (p.length === 0) throw new Error('path must have at least one element');
    for (let i = 0; i < p.length; i++) {
      const e = p[i];
      if (!(typeof e === "string")) throw new Error('path element must be a string');
      p[i] = e.trim();
    }
    this._path = p;
    this.statement = statement || null;
  }
  get path() {
    return this._path;
  }
  toString() {
    return `Data(path: [${this.path.join(', ')}], statement: ${this.statement})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Data.namespace.href && tag === Data.tag)) throw `not a ${Data.tag}`;
      const maybePath = element.attributes.path;
      if (typeof maybePath !== 'string') throw new Error(`${Data.tag} must have a path`);
      let path = [];
      try {
        path = JSON.parse(maybePath);
        if (!(path instanceof Array && path.length > 0)) throw new Error('invalid data path');
        for (let i = 0; i < path.length; i++) {
          const pathElement = path[i];
          if (!(typeof pathElement === "string")) {
            throw new Error('invalid path element');
          }
        }
      } catch (error) {
        throw new Error(`Not a valid data path: "${maybePath}"`);
      }
      let statement = null;
      for (const statementElement of element.children) {
        if (!(statementElement.type === XmlNode.TYPE_ELEMENT)) continue;
        statement = Instruction.statementFromXmlElement(statementElement, nsStack);
        break;
      }
      if (statement === null) {
        result = new Data(path);
      } else {
        result = new Data(path, statement);
      }
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Data) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Data.tag, prefix), element = new XmlElement(name, attributes, children);
    attributes.path = JSON.stringify(this.path);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    if (this.statement) {
      nsStack.push(element);
      children.push(this.statement.toXmlElement(nsStack));
      nsStack.pop();
    }
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Data.tag) throw new Error(`not a ${Data.tag}`);
    if (encoded.value) {
      if (encoded.value.statement) {
        return new Data(encoded.value.path, Instruction.statementFromIndexedDb(encoded.value.statement));
      }
    }
    return new Data(encoded.value.path);
  }
  toIndexedDb() {
    return {
      type: Data.tag,
      value: {
        path: this.path,
        statement: this.statement ? this.statement.toIndexedDb() : null
      }
    };
  }
}
class Try extends Instruction {
  static tag = "try";
  statement;
  _catchClauses;
  static build(statement, catchClauses) {
    return new Try(statement, catchClauses);
  }
  constructor(statement, catchClauses) {
    super();
    if (!statement) throw new Error('try must contain one statement');
    let s;
    if (statement instanceof Array) {
      s = new Sequence(...statement);
    } else {
      s = statement;
    }
    this.statement = s;
    const c = [];
    if (!(catchClauses instanceof Array)) catchClauses = [
      catchClauses
    ];
    for (const catchClauseArg of catchClauses) {
      const catchClause = Object.create(null);
      catchClause['catch'] = [];
      catchClause['do'] = [];
      if (typeof catchClauseArg['catch'] === 'string') {
        catchClause['catch'] = [
          catchClauseArg['catch']
        ];
      } else if (catchClauseArg['catch'] instanceof Array) {
        catchClause['catch'] = catchClauseArg['catch'];
      }
      for (const faultType of catchClause['catch']) try {
        new PlatformFault(faultType);
      } catch (_error) {
        try {
          new Fault(faultType);
        } catch (_error) {
          throw new Error(`Not a valid fault type: "${faultType}"`);
        }
      }
      if (catchClauseArg['do']) {
        catchClause['do'] = catchClauseArg['do'];
        if (!(catchClauseArg['do'] instanceof Array)) {
          catchClause['do'] = [
            catchClauseArg['do']
          ];
        }
      }
      if (catchClause['do'].length === 0) throw new Error('catch clause must have at least one statement');
      c.push(catchClause);
    }
    if (c.length === 0) throw new Error('try must contain at least one catch clause');
    this._catchClauses = c;
  }
  get catchClauses() {
    return this._catchClauses;
  }
  toString() {
    let catchClauses = '';
    for (const catchClause of this.catchClauses) {
      if (catchClauses.length > 0) catchClauses += ', ';
      catchClauses += `{catch: "${catchClause.catch.join(', ')}", do: [`;
      catchClauses += catchClause.do.map((instruction) => `${instruction}`).join(', ');
      catchClauses += `]`;
      catchClauses += '}';
    }
    catchClauses = `[${catchClauses}]`;
    this.catchClauses.map((cc) => ({
      catch: cc.catch.length > 0 ? cc.catch.join(', ') : [],
      do: [
        cc.do.map((d) => d.toString()).join(', ')
      ]
    }));
    return `Try(${this.statement}, ${catchClauses})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Try.namespace.href && tag === Try.tag)) throw `not a ${Try.tag}`;
      let statement = null, catchClauses = [];
      for (const e of element.children) {
        if (!(e.type === XmlNode.TYPE_ELEMENT)) continue;
        if (!statement) {
          statement = Instruction.statementFromXmlElement(e, nsStack);
          continue;
        }
        try {
          nsStack.push(e);
          const catchNamespace = nsStack.findNamespace(e.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(e.name);
          if (!catchNamespace) throw new Error(`element without namespace`);
          if (!(new URL(catchNamespace).href === Try.namespace.href && tag === 'catch')) throw `not a catch clause`;
          let faultsToCatch = [], catchStatements = [];
          if (typeof e.attributes.faults === 'string') {
            faultsToCatch = JSON.parse(e.attributes.faults).map((s) => s.trim());
            for (const faultType of faultsToCatch) try {
              new PlatformFault(faultType);
            } catch (_error) {
              try {
                new Fault(faultType);
              } catch (_error) {
                throw new Error(`Not a valid fault type: "${faultType}"`);
              }
            }
          }
          for (const catchStatementElement of e.children) {
            if (!(catchStatementElement.type === XmlNode.TYPE_ELEMENT)) continue;
            const catchStatement = Instruction.statementFromXmlElement(catchStatementElement, nsStack);
            catchStatements.push(catchStatement);
          }
          if (catchStatements.length === 0) throw new Error(`catch clause has no statement`);
          catchClauses.push({
            catch: faultsToCatch,
            do: catchStatements
          });
        } catch (error) {
          errorMessage = `${error}`;
        } finally {
          nsStack.pop();
        }
      }
      if (!statement) throw new Error(`try has no statement`);
      if (catchClauses.length === 0) throw new Error(`try has no catch clause`);
      result = new Try(statement, catchClauses);
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Try) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Try.tag, prefix), element = new XmlElement(name, attributes, children);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    nsStack.push(element);
    children.push(this.statement.toXmlElement(nsStack));
    for (const catchClause of this.catchClauses) {
      const catchElement = new XmlElement(XmlNamespaceStack.elementName('catch', prefix), catchClause['catch'].length > 0 ? {
        faults: JSON.stringify(catchClause['catch'])
      } : {}, catchClause['do'].map((instruction) => instruction.toXmlElement(nsStack)));
      children.push(catchElement);
    }
    nsStack.pop();
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Try.tag) throw new Error(`not a ${Try.tag}`);
    const statement = Instruction.statementFromIndexedDb(encoded.value.statement), catchClauses = encoded.value.catch.map((c) => ({
      'catch': c.catch,
      'do': c.do.map((encodedStatement) => Instruction.statementFromIndexedDb(encodedStatement))
    }));
    return new Try(statement, catchClauses);
  }
  toIndexedDb() {
    return {
      type: Try.tag,
      value: {
        statement: this.statement.toIndexedDb(),
        catch: this.catchClauses.map((c) => ({
          'catch': c.catch,
          'do': c.do.map((statement) => statement.toIndexedDb())
        }))
      }
    };
  }
}
class Goto extends Instruction {
  static tag = "goto";
  _href = null;
  _parameters = [];
  static build(href) {
    return new Goto(href);
  }
  constructor(href) {
    super();
    const parameters = [];
    if (typeof href === 'string') this._href = href;
    if (!parameters) return;
    const params = parameters instanceof Array ? parameters : [
      parameters
    ];
    for (const value of params.values()) {
      this._parameters.push(value);
    }
  }
  get href() {
    return this._href;
  }
  get parameters() {
    return this._parameters;
  }
  parameter(name) {
    const param = this._parameters.find((p) => p.name === name);
    if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
    return param.value;
  }
  toString() {
    let parameters = null, result = '';
    for (const param of this.parameters) {
      if (parameters === null) {
        parameters = '';
      } else {
        parameters += ', ';
      }
      parameters += `{name: ${param.name}, value: ${param.value}}`;
    }
    if (typeof this.href === 'string') {
      result += `href: ${this.href}`;
    }
    if (typeof parameters === 'string') {
      if (result.length > 0) result += ', ';
      result += `parameters: [${parameters}]`;
    }
    return `Goto(${result})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Goto.namespace.href && tag === Goto.tag)) throw `not a ${Goto.tag}`;
      let href = null, parameters = [];
      if (typeof element.attributes.href === 'string') href = element.attributes.href;
      for (const parametersElement of element.children) {
        if (parametersElement.type !== XmlNode.TYPE_ELEMENT) continue;
        try {
          nsStack.push(parametersElement);
          const parametersNamespace = nsStack.findNamespace(parametersElement.name), parametersTag = XmlNamespaceStack.getElementNameWithoutPrefix(parametersElement.name);
          if (!parametersNamespace) throw new Error(`not a namespace`);
          if (!(new URL(parametersNamespace).href === Goto.namespace.href && parametersTag === 'data-args')) throw `not a parameters`;
          for (const parameterElement of parametersElement.children) {
            if (parameterElement.type !== XmlNode.TYPE_ELEMENT) continue;
            try {
              nsStack.push(parameterElement);
              const parameterNamespace = nsStack.findNamespace(parameterElement.name), parameterTag = XmlNamespaceStack.getElementNameWithoutPrefix(parameterElement.name);
              if (!parameterNamespace) throw new Error(`not a namespace`);
              if (!(new URL(parameterNamespace).href === Goto.namespace.href && parameterTag === 'data-arg')) throw `not a parameter`;
              if (!(typeof parameterElement.attributes.name === 'string')) throw new Error('parameter without name');
              const parameterName = parameterElement.attributes.name;
              for (const parameterValueElement of parameterElement.children) {
                if (parameterValueElement.type !== XmlNode.TYPE_ELEMENT) continue;
                parameters.push({
                  name: parameterName,
                  value: Instruction.statementFromXmlElement(parameterValueElement, nsStack)
                });
              }
            } catch (error) {
              errorMessage = `${error}`;
            } finally {
              nsStack.pop();
            }
          }
        } catch (error) {
          errorMessage = `${error}`;
        } finally {
          nsStack.pop();
        }
      }
      result = new Goto(href);
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Goto) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Goto.tag, prefix), element = new XmlElement(name, attributes, children);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    if (typeof this.href === 'string') attributes['href'] = this.href;
    if (this.parameters.length > 0) {
      nsStack.push(element);
      const parametersAttributes = Object.create(null), parametersChildren = [], parametersElement = new XmlElement(XmlNamespaceStack.elementName('data-args', prefix), parametersAttributes, parametersChildren);
      element.children.push(parametersElement);
      for (const parameter of this.parameters) {
        const parameterAttributes = Object.create(null), parameterChildren = [], parameterElement = new XmlElement(XmlNamespaceStack.elementName('data-arg', prefix), parameterAttributes, parameterChildren);
        parameterAttributes['name'] = parameter.name;
        parameterChildren.push(parameter.value.toXmlElement(nsStack));
        parametersChildren.push(parameterElement);
      }
      nsStack.pop();
    }
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Goto.tag) throw new Error(`not a ${Goto.tag}`);
    return new Goto(encoded.value.href);
  }
  toIndexedDb() {
    return {
      type: Goto.tag,
      value: {
        href: this.href,
        parameters: this.parameters.map((param) => ({
          name: param.name,
          value: param.value.toIndexedDb()
        }))
      }
    };
  }
}
class Call extends Instruction {
  static tag = "call";
  _object = [];
  _href = null;
  _parameters = [];
  _objectParameters = [];
  _sendParameters = false;
  static build(object, href, parameters, objectParameters) {
    return new Call(object, href, parameters, objectParameters);
  }
  constructor(object, href, parameters, objectParameters) {
    super();
    const sendParameters = false;
    const o = object === null || typeof object === 'undefined' ? [
      '@'
    ] : object instanceof Array ? object : [
      object
    ];
    if (o.length === 0) o.push('@');
    for (let i = 0; i < o.length; i++) {
      const e = o[i];
      if (!(typeof e === "string")) throw new Error('object path element must be a string');
      o[i] = e.trim();
    }
    this._object = o;
    if (typeof href === 'string') this._href = href;
    if (objectParameters) {
      const objectParams = objectParameters instanceof Array ? objectParameters : [
        objectParameters
      ];
      for (const value of objectParams.values()) {
        this._objectParameters.push(value);
      }
    }
    if (parameters) {
      const params = parameters instanceof Array ? parameters : [
        parameters
      ];
      for (const value of params.values()) {
        this._parameters.push(value);
      }
    }
    if (!(false === null || typeof false === 'undefined')) {
      this._sendParameters = sendParameters;
    }
  }
  get object() {
    return this._object;
  }
  get href() {
    return this._href;
  }
  get objectParameters() {
    return this._objectParameters;
  }
  get parameters() {
    return this._parameters;
  }
  get sendParameters() {
    return this._sendParameters;
  }
  objectParameter(name) {
    const objectParam = this._objectParameters.find((p) => p.name === name);
    if (typeof objectParam === 'undefined') throw new Error(`object parameter "${name}" not found`);
    return objectParam.object;
  }
  parameter(name) {
    const param = this._parameters.find((p) => p.name === name);
    if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
    return param.value;
  }
  toString() {
    let objectParameters = null, parameters = null, result = '';
    for (const objectParam of this.objectParameters) {
      if (objectParameters === null) {
        objectParameters = '';
      } else {
        objectParameters += ', ';
      }
      objectParameters += `{name: ${objectParam.name}, object: ${JSON.stringify(objectParam.object)}}`;
    }
    for (const param of this.parameters) {
      if (parameters === null) {
        parameters = '';
      } else {
        parameters += ', ';
      }
      parameters += `{name: ${param.name}, value: ${param.value}}`;
    }
    if (typeof this.href === 'string') {
      result += `href: ${this.href}`;
    }
    if (typeof objectParameters === 'string') {
      if (result.length > 0) result += ', ';
      result += `objectParameters: [${objectParameters}]`;
    }
    if (typeof parameters === 'string') {
      if (result.length > 0) result += ', ';
      result += `parameters: [${parameters}]`;
    }
    return `Call(object: [${this.object.join(', ')}], ${result})`;
  }
  static fromXmlElement(element, namespaceStack) {
    const nsStack = namespaceStack ? namespaceStack : XmlNamespaceStack.forElement(element);
    let result = null, errorMessage = '';
    try {
      nsStack.push(element);
      const namespace = nsStack.findNamespace(element.name), tag = XmlNamespaceStack.getElementNameWithoutPrefix(element.name);
      if (!namespace) throw new Error(`not a namespace`);
      if (!(new URL(namespace).href === Call.namespace.href && tag === Call.tag)) throw `not a ${Call.tag}`;
      const maybeObject = element.attributes.object;
      if (typeof maybeObject !== 'string') throw new Error(`${Call.tag} must have a path`);
      let object = [];
      try {
        object = JSON.parse(maybeObject);
        if (!(object instanceof Array && object.length > 0)) throw new Error('invalid object path');
        for (let i = 0; i < object.length; i++) {
          const pathElement = object[i];
          if (!(typeof pathElement === "string")) {
            throw new Error('invalid path element');
          }
        }
      } catch (error) {
        throw new Error(`Not a valid object path: "${maybeObject}"`);
      }
      let href = null, objectParameters = [], parameters = [], sendParameters = false;
      if (typeof element.attributes.href === 'string') href = element.attributes.href;
      for (const objectParametersElement of element.children) {
        if (objectParametersElement.type !== XmlNode.TYPE_ELEMENT) continue;
        try {
          nsStack.push(objectParametersElement);
          const objectParametersNamespace = nsStack.findNamespace(objectParametersElement.name), objectParametersTag = XmlNamespaceStack.getElementNameWithoutPrefix(objectParametersElement.name);
          if (!objectParametersNamespace) throw new Error(`not a namespace`);
          if (!(new URL(objectParametersNamespace).href === Call.namespace.href && objectParametersTag === 'object-args')) throw `not an object parameters element`;
          for (const objectParameterElement of objectParametersElement.children) {
            if (objectParameterElement.type !== XmlNode.TYPE_ELEMENT) continue;
            try {
              nsStack.push(objectParameterElement);
              const objectParameterNamespace = nsStack.findNamespace(objectParameterElement.name), objectParameterTag = XmlNamespaceStack.getElementNameWithoutPrefix(objectParameterElement.name);
              if (!objectParameterNamespace) throw new Error(`not a namespace`);
              if (!(new URL(objectParameterNamespace).href === Call.namespace.href && objectParameterTag === 'object-arg')) throw `not an object parameter`;
              if (!(typeof objectParameterElement.attributes.name === 'string')) throw new Error('object parameter without name');
              const objectParameterName = objectParameterElement.attributes.name, objectParameterObject = objectParameterElement.attributes.object;
              objectParameters.push({
                name: objectParameterName,
                object: JSON.parse(objectParameterObject)
              });
            } catch (error) {
              errorMessage = `${error}`;
            } finally {
              nsStack.pop();
            }
          }
        } catch (error) {
          errorMessage = `${error}`;
        } finally {
          nsStack.pop();
        }
      }
      for (const parametersElement of element.children) {
        if (parametersElement.type !== XmlNode.TYPE_ELEMENT) continue;
        try {
          nsStack.push(parametersElement);
          const parametersNamespace = nsStack.findNamespace(parametersElement.name), parametersTag = XmlNamespaceStack.getElementNameWithoutPrefix(parametersElement.name);
          if (!parametersNamespace) throw new Error(`not a namespace`);
          if (!(new URL(parametersNamespace).href === Call.namespace.href && parametersTag === 'data-args')) throw `not a parameters element`;
          sendParameters = parametersElement.attributes.name === 'true';
          for (const parameterElement of parametersElement.children) {
            if (parameterElement.type !== XmlNode.TYPE_ELEMENT) continue;
            try {
              nsStack.push(parameterElement);
              const parameterNamespace = nsStack.findNamespace(parameterElement.name), parameterTag = XmlNamespaceStack.getElementNameWithoutPrefix(parameterElement.name);
              if (!parameterNamespace) throw new Error(`not a namespace`);
              if (!(new URL(parameterNamespace).href === Call.namespace.href && parameterTag === 'data-arg')) throw `not a parameter`;
              if (!(typeof parameterElement.attributes.name === 'string')) throw new Error('parameter without name');
              const parameterName = parameterElement.attributes.name;
              for (const parameterValueElement of parameterElement.children) {
                if (parameterValueElement.type !== XmlNode.TYPE_ELEMENT) continue;
                parameters.push({
                  name: parameterName,
                  value: Instruction.statementFromXmlElement(parameterValueElement, nsStack)
                });
              }
            } catch (error) {
              errorMessage = `${error}`;
            } finally {
              nsStack.pop();
            }
          }
        } catch (error) {
          errorMessage = `${error}`;
        } finally {
          nsStack.pop();
        }
      }
      result = new Call(object, href, parameters, objectParameters);
    } catch (error) {
      errorMessage = `${error}`;
    } finally {
      nsStack.pop();
    }
    if (result instanceof Call) {
      return result;
    }
    throw new Error(errorMessage);
  }
  toXmlElement(namespaceStack) {
    const namespace = Instruction.namespace.href, nsStack = namespaceStack || new XmlNamespaceStack(), existingPrefix = nsStack.prefixFor(namespace, null), useNewPrefix = typeof existingPrefix !== 'string', newPrefix = useNewPrefix ? nsStack.prefixFor(namespace, [
      'q'
    ]) : null, prefix = newPrefix || existingPrefix, attributes = Object.create(null), children = [], name = XmlNamespaceStack.elementName(Call.tag, prefix), element = new XmlElement(name, attributes, children);
    if (useNewPrefix) {
      attributes[XmlNamespaceStack.nsAttrName(newPrefix)] = namespace;
    }
    attributes['object'] = JSON.stringify(this.object);
    if (typeof this.href === 'string') attributes['href'] = this.href;
    if (this.objectParameters.length > 0) {
      nsStack.push(element);
      const objectParametersAttributes = Object.create(null), objectParametersChildren = [], objectParametersElement = new XmlElement(XmlNamespaceStack.elementName('object-args', prefix), objectParametersAttributes, objectParametersChildren);
      element.children.push(objectParametersElement);
      for (const objectParameter of this.objectParameters) {
        const objectParameterAttributes = Object.create(null), objectParameterChildren = [], objectParameterElement = new XmlElement(XmlNamespaceStack.elementName('object-arg', prefix), objectParameterAttributes, objectParameterChildren);
        objectParameterAttributes['name'] = objectParameter.name;
        objectParameterAttributes['object'] = JSON.stringify(objectParameter.object);
        objectParametersChildren.push(objectParameterElement);
      }
      nsStack.pop();
    }
    if (this.parameters.length > 0) {
      nsStack.push(element);
      const parametersAttributes = Object.create(null), parametersChildren = [], parametersElement = new XmlElement(XmlNamespaceStack.elementName('data-args', prefix), parametersAttributes, parametersChildren);
      if (this.sendParameters) parametersAttributes['send'] = `${this.sendParameters}`;
      element.children.push(parametersElement);
      for (const parameter of this.parameters) {
        const parameterAttributes = Object.create(null), parameterChildren = [], parameterElement = new XmlElement(XmlNamespaceStack.elementName('data-arg', prefix), parameterAttributes, parameterChildren);
        parameterAttributes['name'] = parameter.name;
        parameterChildren.push(parameter.value.toXmlElement(nsStack));
        parametersChildren.push(parameterElement);
      }
      nsStack.pop();
    }
    return element;
  }
  static fromIndexedDb(encoded) {
    if (encoded.type !== Call.tag) throw new Error(`not a ${Call.tag}`);
    return new Call(encoded.value.object, encoded.value.href, encoded.value.parameters.map((parameter) => ({
      name: parameter.name,
      value: Instruction.statementFromIndexedDb(parameter.value)
    })), encoded.value.objectParameters);
  }
  toIndexedDb() {
    return {
      type: Call.tag,
      value: {
        object: this.object,
        href: this.href,
        parameters: this.parameters.map((param) => ({
          name: param.name,
          value: param.value.toIndexedDb()
        })),
        sendParameters: this.sendParameters,
        objectParameters: this.objectParameters
      }
    };
  }
}
Instruction.registry = [
  Fault,
  PlatformFault,
  Return,
  Sequence,
  Data,
  Try,
  Goto,
  Call
];
class Script {
  static contentType = 'application/xml';
  _instruction;
  static build(instruction) {
    return new Script(instruction);
  }
  constructor(instruction) {
    if (!(instruction instanceof Instruction)) throw new Error('one or more parameters required');
    this._instruction = instruction;
  }
  get instruction() {
    return this._instruction;
  }
  toString() {
    return `${this.instruction}`;
  }
  static fromXml(xmlStr) {
    const doc = new Parser(xmlStr).document, instruction = Instruction.fromXmlElement(doc.root);
    return new Script(instruction);
  }
  toXml() {
    return Writer.elementToString(this.instruction.toXmlElement());
  }
}
class PhaseParameters {
  static namespace = new URL('https://qworum.net/ns/v1/phase-parameters/');
  _params = [];
  static build(params) {
    return new PhaseParameters(params);
  }
  constructor(params) {
    if (params.length === 0) throw new Error('one or more parameters required');
    this._params = params;
  }
  get parameters() {
    return this._params;
  }
  parameter(name) {
    const param = this._params.find((p) => p.name === name);
    if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
    return param.value;
  }
  static fromXml(xmlStr) {
    try {
      const params = [], doc = new Parser(xmlStr).document, nsStack = XmlNamespaceStack.forElement(doc.root);
      if (!doc) throw new Error('not a document');
      if (!nsStack) throw new Error('namespace stack was not initialized');
      let elementNs = nsStack.findNamespace(doc.root.name), elementNameParts = doc.root.name.split(':'), elementName = elementNameParts.length === 1 ? elementNameParts[0] : elementNameParts[1];
      if (!(elementNs === PhaseParameters.namespace.href && elementName === 'data-args')) throw new Error('not a valid phase-parameters message');
      for (const paramElement of doc.root.children) {
        if (paramElement.type !== XmlNode.TYPE_ELEMENT) continue;
        let paramElementNs = nsStack.findNamespace(paramElement.name), paramElementNameParts = paramElement.name.split(':'), paramElementName = paramElementNameParts.length === 1 ? paramElementNameParts[0] : paramElementNameParts[1];
        if (!(paramElementNs === PhaseParameters.namespace.href && paramElementName === 'data-arg')) throw new Error('not a param');
        const paramName = paramElement.attributes['name'];
        if (typeof paramName !== 'string') throw new Error('param name must be a string');
        nsStack.push(paramElement);
        let data;
        for (const dataElement of paramElement.children) {
          if (dataElement.type !== XmlNode.TYPE_ELEMENT) continue;
          try {
            data = DataValue.fromXmlElement(dataElement, nsStack);
          } catch (error) { }
          break;
        }
        nsStack.pop();
        if (!data) throw new Error(`param "${paramName}" does not contain any data`);
        params.push({
          name: paramName,
          value: data
        });
      }
      return new PhaseParameters(params);
    } catch (error) {
      console.error(`[PhaseParameters.read] ${error}`);
    }
    throw new Error('not a valid phase-parameters message');
  }
  toXml() {
    const attributes = {
      xmlns: PhaseParameters.namespace.href
    }, children = [], params = new XmlElement('data-args', attributes, children), nsStack = new XmlNamespaceStack();
    nsStack.push(params);
    for (const param of this.parameters) {
      const data = param.value, paramElement = new XmlElement('data-arg', {
        name: param.name
      }, [
        param.value.toXmlElement(nsStack)
      ]);
      children.push(paramElement);
    }
    nsStack.pop();
    return Writer.elementToString(params);
  }
  toString() {
    let result;
    for (const param of this.parameters) {
      result = result ? `${result}, ${param.name}: ${param.value}` : `${param.name}: ${param.value}`;
    }
    return `PhaseParameters(${result})`;
  }
}
// const MESSAGE_VERSION = '1.1.2';

export {
  PhaseParameters, Script, Call, Goto, Try, Data, Sequence, Return, PlatformFault, PlatformFaultTypeError, Fault, FaultTypeError, Instruction, SemanticData, Json, GenericData, DataValue, 
};
