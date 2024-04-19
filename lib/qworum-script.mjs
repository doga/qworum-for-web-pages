import { 
  N3,

  XmlNamespaceStack, XmlDocument, XmlElement, XmlProcessingInstruction, XmlCdata, XmlComment, XmlText, XmlNode,
  Parser, Writer,
} from "../deps.mjs";


class DataValue {
  static registry = [];
  toString() {
      throw new Error('not implemented');
  }
  static fromJsonable(encodedData) {
      let errorMessage = 'Not valid data';
      for (const dataType of this.registry){
          try {
              const data = dataType.fromJsonable(encodedData);
              return data;
          } catch (error) {}
      }
      throw new Error(errorMessage);
  }
  toJsonable() {
      throw new Error('not implemented');
  }
}


class GenericData extends DataValue {
  static namespace = new URL('https://qworum.net/ns/v1/data/');
  toString() {
      throw new Error('not implemented');
  }
  static fromJsonable(encodedData) {
      let errorMessage = 'Not valid data';
      for (const dataType of this.registry){
          try {
              const data = dataType.fromJsonable(encodedData);
              return data;
          } catch (error) {}
      }
      throw new Error(errorMessage);
  }
  toJsonable() {
      throw new Error('not implemented');
  }
}


class Json extends GenericData {
  static tag = 'json';
  _value;
  static build(value) {
      return new Json(value);
  }
  constructor(value){
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
  static fromJsonable(encodedData) {
      if (!(encodedData && typeof encodedData === 'object' && !Array.isArray(encodedData) && encodedData.type === `${Json.namespace} ${Json.tag}`)) throw new Error('wrong IndexedDB object');
      return new Json(encodedData.value);
  }
  toJsonable() {
      return {
          type: `${Json.namespace} ${Json.tag}`,
          value: this.value
      };
  }
}


class SemanticData extends GenericData {
  static tag = 'semantic';
  _value;
  static build() {
      return new SemanticData();
  }
  constructor(){
  // constructor(text){
      super();
      this._value = new N3.Store();
      // this._value = text;
  }
  get value() {
      return this._value;
  }
  _toString() {
      return this.value;
  }
  /**
   * @param {string} text - RDF data in one of these formats: Turtle, TriG, N-Triples, N-Quads
   * @param {(URL|undefined)} baseIRI - The URL of the RDF document
   * @throws {(TypeError|Error)}
   * @returns {void}
   */
  async readFromTextSync(text, baseIRI){ // WARNING: MUST BE ASYNC???
      if (typeof text !== 'string') {
        throw new TypeError(`not a text`); 
      }
      if(baseIRI && !(baseIRI instanceof URL)) {
        throw new TypeError(`not an IRI`);
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
          // reject(new Error(`Error while parsing semantic data:${parsingError}`));
          return;
        }
        if (quad) {
          // // console.debug(`\nadding quad:\n${JSON.stringify(quad)}`);
          store.add(quad);
        // } else {
          // // console.debug(`\nfinished reading. prefixes:\n${JSON.stringify(prefixes)}\n`);
          // remember the new prefixes
          // this.addPrefixes(prefixes);
          // resolve(true);
        }
      };
      parser.parse(text, parserCallback);
  }
  /**
   * @param {string} text - RDF data in one of these formats: Turtle, TriG, N-Triples, N-Quads
   * @param {(URL|undefined)} baseIRI - The URL of the RDF document
   * @returns {Promise.<boolean>}
   * @async
   */
  async readFromText(text, baseIRI){ // WARNING: MUST BE ASYNC
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
          // // console.debug(`\nadding quad:\n${JSON.stringify(quad)}`);
          store.add(quad);
        } else {
          // // console.debug(`\nfinished reading. prefixes:\n${JSON.stringify(prefixes)}\n`);
          // remember the new prefixes
          // this.addPrefixes(prefixes);
          resolve(true);
        }
      };
      parser.parse(text, parserCallback);
    });
  }

  async readFromUrl(url){
      try {
        // // console.debug(`Fetching: ${url}`);
        const
        response = await fetch(url),
        text     = await response.text();

        return this.readFromText(text,url);
      } catch (error) {
        Promise.reject(error);
      }
  }  
  
  toRawString(type) {
    let format;
    if(!type){
      type = 'trig';
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
    const writer = new N3.Writer({ format });
    for (const quad of this.value) writer.addQuad(quad);
    writer.end((err, res) => {
      if (err) {
        error = new Error(`Error while writing ${format}: ${err}`);
      } else {
        result = res;
      }
    });
    if(error)throw error;
    return result;
  }

  toString() {
    const res = this.toRawString().split('\n').map(line => `  ${line}`).join('\n');
    return `SemanticData(\n${res}\n)`;
  }

  static fromJsonable(encodedData) {
      if (!(
        encodedData && 
        typeof encodedData === 'object' && 
        !Array.isArray(encodedData) && 
        encodedData.type === `${SemanticData.namespace} ${SemanticData.tag}` && 
        encodedData.value instanceof Array
      )) throw new Error('not a Jsonable object');
      const res = new SemanticData();

      for (const quad of encodedData.value) {
        // // console.debug(`deserialised: ${JSON.stringify(this._jsonableToQuad(quad))}`);
        res.value.add(this._jsonableToQuad(quad));
      }

      return res;
  }

  toJsonable() {
    const dataset = [];
    for (const quad of this.value) {
      dataset.push(SemanticData._quadToJsonable(quad));
    }

    return {
      type: `${SemanticData.namespace} ${SemanticData.tag}`,
      value: dataset
    };
  }

  static _jsonableToNamedNode(term){
    if(term.termType !== 'NamedNode')return null;
    return N3.DataFactory.namedNode(term.value);
  }

  static _jsonableToBlankNode(term){
    if(term.termType !== 'BlankNode')return null;
    return N3.DataFactory.blankNode(term.value);
  }
  
  static _jsonableToLiteral(term){
    if(term.termType !== 'Literal')return null;
    const languageOrDatatype = term.language === '' ? N3.DataFactory.namedNode(term.datatype) : term.language;
    return N3.DataFactory.literal(term.value, languageOrDatatype);
  }

  static _jsonableToDefaultGraph(term){
    if(term.termType !== 'DefaultGraph')return null;
    return N3.DataFactory.defaultGraph();
  }

  static _jsonableToQuad(quad){
    if(quad.termType !== 'Quad')return null;
    const 
    subject = (
      this._jsonableToNamedNode(quad.subject) || this._jsonableToBlankNode(quad.subject) ||
      this._jsonableToQuad(quad.subject)
    ),
    predicate = this._jsonableToNamedNode(quad.predicate),
    object = (
      this._jsonableToNamedNode(quad.object) || this._jsonableToBlankNode(quad.object) ||
      this._jsonableToLiteral(quad.object)
    ),
    graph = (
      this._jsonableToNamedNode(quad.graph) || this._jsonableToBlankNode(quad.graph) ||
      this._jsonableToDefaultGraph(quad.graph)
    );
    return N3.DataFactory.quad(subject,predicate,object,graph); 
  }

  static _quadToJsonable(quad){
    const termType = 'Quad';
    if(quad.termType !== termType)return null;
    let subject, predicate, object, graph;

    if(quad.subject.termType === termType) {
      subject = this._quadToJsonable(quad.subject);
    } else {
      subject = {termType: quad.subject.termType, value: quad.subject.value}; // NamedNode or BlankNode
    }
    
    predicate = {termType: quad.predicate.termType, value: quad.predicate.value}; // NamedNode

    object = {termType: quad.object.termType, value: quad.object.value}; // NamedNode, Literal, BlankNode
    if (quad.object.termType === 'Literal') {
      object.language = quad.subject.language;
      object.datatype = quad.subject.datatype;
    }

    graph = {termType: quad.graph.termType, value: quad.graph.value}; // DefaultGraph, NamedNode, BlankNode

    return {termType, subject, predicate, object, graph };
  }

}


DataValue.registry = [
  Json,
  SemanticData
];

class Statement { // instruction or data value
  static fromJsonable(encodedStatement) {
      try {
          const instruction = Instruction.fromJsonable(encodedStatement);
          return instruction;
      } catch (error) {}
      try {
          const o = DataValue.fromJsonable(encodedStatement);
          return o;
      } catch (error1) {}
      throw new Error('not a statement');
  }

}

class Instruction { // not data value
  static namespace = new URL('https://qworum.net/ns/v1/instruction/');
  static registry = [];
  toString() {
    throw new Error('not implemented');
  }
  static fromJsonable(encoded) {
    let errorMessage = 'Not valid instruction';
    for (const instructionType of this.registry){
      try {
        const instruction = instructionType.fromJsonable(encoded);
        return instruction;
      } catch (error) {}
    }
    throw new Error(errorMessage);
  }
  toJsonable() {
    throw new Error('not implemented');
  }
}


class FaultTypeError extends Error {
  constructor(message){
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
      ...this.serviceSpecificTypes,
      ...this.entitlementTypes
  ];
  static userAgentTypes = [
      'user-agent',
      'runtime'
  ];
  static types = [
      this.serviceTypes,
      this.userAgentTypes
  ].flat();
  static defaultType = this.serviceSpecificTypes[0];
  _type;
  static build(type) { 
    // scripts generated by services can only contain service-specific faults,
    // all others are raised implicity by the runtime.
    return new Fault(type);
  }
  constructor(type, types){
      super();
      if (!type) type = Fault.defaultType;
      const allowedFaultTypes = types || Fault.serviceSpecificTypes;
      if (!allowedFaultTypes.find(Fault._typeMatcher(type))) throw new FaultTypeError();
      this._type = type;
  }
  static _typeMatcher(type) {
    return (typePattern)=>{
      if (
        (typeof typePattern === 'string' && typePattern === type) || 
        (typePattern instanceof RegExp && type?.match(typePattern))
      ) return true;
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
  static fromJsonable(encoded) {
      if (encoded.type !== Fault.tag) throw new Error(`not a ${this.tag}`);
      return new Fault(this._typefromJsonable(encoded));
  }
  static _typefromJsonable(encoded) {
      if (encoded.type !== Fault.tag) throw new Error(`not a ${this.tag}`);
      return encoded.value?.type || Fault.defaultType;
  }
  toJsonable() {
      return {
          type: Fault.tag,
          value: {
              type: this.type
          }
      };
  }
}


class PlatformFaultTypeError extends Error {
  constructor(message){
      super(message || 'Not a platform fault');
  }
}


class PlatformFault extends Fault { // faults that only the Qworum runtime can raise.
  static _platformFaultTypes = PlatformFault.types.filter((type)=>!PlatformFault.serviceSpecificTypes.includes(type));
  constructor(type){
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
  static fromJsonable(encoded) {
      if (encoded.type !== Fault.tag) throw new Error(`not a ${this.tag}`);
      return new PlatformFault(Fault._typefromJsonable(encoded));
  }
  toJsonable() {
      return super.toJsonable();
  }
}


class Return extends Instruction {
  static tag = "return";
  statement;
  static build(statement) {
      return new Return(statement);
  }
  constructor(statement){
      super();
      if (!statement) throw new Error('statement required');
      this.statement = statement;
  }
  toString() {
      return `Return(${this.statement})`;
  }
  static fromJsonable(encoded) {
      if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
      return new Return(Statement.fromJsonable(encoded.value.statement));
  }
  toJsonable() {
      return {
          type: Return.tag,
          value: {
              statement: this.statement.toJsonable()
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
  constructor(...statements){
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
  static fromJsonable(encoded) {
      if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
      const statements = encoded.value.statements.map((encodedStatement)=>Statement.fromJsonable(encodedStatement));
      return new Sequence(...statements);
  }
  toJsonable() {
      return {
          type: Sequence.tag,
          value: {
              statements: this.statements.map((statement)=>statement.toJsonable())
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
  constructor(path, statement){
      super();
      const p = path instanceof Array ? path : [
          path
      ];
      if (p.length === 0) throw new Error('path must have at least one element');
      for(let i = 0; i < p.length; i++){
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
  static fromJsonable(encoded) {
      if (encoded.type !== Data.tag) throw new Error(`not a ${this.tag}`);
      if (encoded.value) {
          if (encoded.value.statement) {
              return new Data(encoded.value.path, Statement.fromJsonable(encoded.value.statement));
          }
      }
      return new Data(encoded.value.path);
  }
  toJsonable() {
      return {
          type: Data.tag,
          value: {
              path: this.path,
              statement: this.statement ? this.statement.toJsonable() : null
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
  constructor(statement, catchClauses){
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
      for (const catchClauseArg of catchClauses){
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
          for (const faultType of catchClause['catch'])try {
              new PlatformFault(faultType);
          } catch (_error1) {
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
      for (const catchClause of this.catchClauses){
          if (catchClauses.length > 0) catchClauses += ', ';
          catchClauses += `{catch: "${catchClause.catch.join(', ')}", do: [`;
          catchClauses += catchClause.do.map((instruction)=>`${instruction}`).join(', ');
          catchClauses += `]`;
          catchClauses += '}';
      }
      catchClauses = `[${catchClauses}]`;
      this.catchClauses.map((cc)=>({
              catch: cc.catch.length > 0 ? cc.catch.join(', ') : [],
              do: [
                  cc.do.map((d)=>d.toString()).join(', ')
              ]
          }));
      return `Try(${this.statement}, ${catchClauses})`;
  }

  static fromJsonable(encoded) {
      if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
      const statement = Statement.fromJsonable(encoded.value.statement), catchClauses = encoded.value.catch.map((c)=>({
              'catch': c.catch,
              'do': c.do.map((encodedStatement)=>Statement.fromJsonable(encodedStatement))
          }));
      return new Try(statement, catchClauses);
  }
  toJsonable() {
      return {
          type: Try.tag,
          value: {
              statement: this.statement.toJsonable(),
              catch: this.catchClauses.map((c)=>({
                      'catch': c.catch,
                      'do': c.do.map((statement)=>statement.toJsonable())
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
  constructor(href){
      super();
      const parameters = [];
      if (typeof href === 'string') this._href = href;
      if (!parameters) return;
      const params = parameters instanceof Array ? parameters : [
          parameters
      ];
      for (const value of params.values()){
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
      const param = this._parameters.find((p)=>p.name === name);
      if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
      return param.value;
  }
  toString() {
      let parameters = null, result = '';
      for (const param of this.parameters){
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
  static fromJsonable(encoded) {
      if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
      return new Goto(encoded.value.href);
  }
  toJsonable() {
      return {
          type: Goto.tag,
          value: {
              href: this.href,
              parameters: this.parameters.map((param)=>({
                      name: param.name,
                      value: param.value.toJsonable()
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
  constructor(object, href, parameters, objectParameters){
      super();
      const sendParameters = false;
      const o = object === null || typeof object === 'undefined' ? [
          '@'
      ] : object instanceof Array ? object : [
          object
      ];
      if (o.length === 0) o.push('@');
      for(let i = 0; i < o.length; i++){
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
          for (const value of objectParams.values()){
              this._objectParameters.push(value);
          }
      }
      if (parameters) {
          const params = parameters instanceof Array ? parameters : [
              parameters
          ];
          for (const value1 of params.values()){
              this._parameters.push(value1);
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
      const objectParam = this._objectParameters.find((p)=>p.name === name);
      if (typeof objectParam === 'undefined') throw new Error(`object parameter "${name}" not found`);
      return objectParam.object;
  }
  parameter(name) {
      const param = this._parameters.find((p)=>p.name === name);
      if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
      return param.value;
  }
  toString() {
      let objectParameters = null, parameters = null, result = '';
      for (const objectParam of this.objectParameters){
          if (objectParameters === null) {
              objectParameters = '';
          } else {
              objectParameters += ', ';
          }
          objectParameters += `{name: ${objectParam.name}, object: ${JSON.stringify(objectParam.object)}}`;
      }
      for (const param of this.parameters){
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

  static fromJsonable(encoded) {
      if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
      return new Call(encoded.value.object, encoded.value.href, encoded.value.parameters.map((parameter)=>({
              name: parameter.name,
              value: Statement.fromJsonable(parameter.value)
          })), encoded.value.objectParameters);
  }
  toJsonable() {
      return {
          type: Call.tag,
          value: {
              object: this.object,
              href: this.href,
              parameters: this.parameters.map((param)=>({
                      name: param.name,
                      value: param.value.toJsonable()
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
  constructor(instruction){
      if (!(instruction instanceof Instruction)) throw new Error('one or more parameters required');
      this._instruction = instruction;
  }
  get instruction() {
      return this._instruction;
  }
  toString() {
      return `${this.instruction}`;
  }
  static fromJsonable(jsonable){
    return Script.build(Instruction.fromJsonable(jsonable));
  }
  toJsonable(){
    return this.instruction.toJsonable();
  }
  toXml() {
      return Writer.elementToString(this.instruction.toXmlElement());
  }
}

export { 
  DataValue, GenericData, Json, SemanticData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
  PlatformFaultTypeError, PlatformFault, 

  FaultTypeError, 
};

