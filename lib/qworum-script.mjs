/**
 * Classes that represent Qworum scripts and data values.
 * @author Doğa Armangil <d.armangil@qworum.net>
 * @license Apache-2.0
 * @see {@link https://qworum.net|Qworum}
 */

import { N3, IRI } from "../deps.mjs";

// TODO remove fromJsonable() from all classes except DataValue and descendants

/** @ignore */
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

/** @ignore */
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
  /** @ignore */
  static tag = 'json';
  /** @ignore */
  _value;

  /** 
   * Builder for [Json data values](https://qworum.net/en/specification/v1/#json). 
   * 
   * @static
   * @param value A value that can be serialized to JSON.
   * @throws {Error}
   * @returns {Json}
   * @example
   * const json = Json.build(2022);
   * @see {@link https://qworum.net/en/specification/v1/#json|Qworum specification}
   */
  static build(value) {
      return new Json(value);
  }
  /** @ignore */
  constructor(value){
      super();
      const json = JSON.stringify(value);
      if (!json) throw new Error(`Value cannot be converted to JSON: ${value}`);
      this._value = value;
  }
  get value() {
      return this._value;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `Json(${JSON.stringify(this.value)})`;
  }
  /** @ignore */
  static fromJsonable(encodedData) {
      if (!(encodedData && typeof encodedData === 'object' && !Array.isArray(encodedData) && encodedData.type === `${Json.namespace} ${Json.tag}`)) throw new Error('wrong IndexedDB object');
      return new Json(encodedData.value);
  }
  /** @ignore */
  toJsonable() {
      return {
          type: `${Json.namespace} ${Json.tag}`,
          value: this.value
      };
  }
}

/** @ignore */
class RdfDataset extends N3.Store { // resolves the named node IRIs before adding a quad to a dataset
  constructor(){
    super();
  }
  add(quad){
    // console.debug(`resolving and adding quad: ${JSON.stringify(quad)}`);
    super.add(RdfDataset._resolve(quad));
  }
  static _resolve(quad){
    try {
      if(quad?.termType !== 'Quad')throw new TypeError('not a quad');
      const url = IRI.parse(`${location}`);
      return N3.DataFactory.quad(
        RdfDataset._resolveNode(quad.subject, url),
        RdfDataset._resolveNode(quad.predicate, url),
        RdfDataset._resolveNode(quad.object, url),
        RdfDataset._resolveNode(quad.graph, url),
      )
    } catch (error) {
      // console.error(error);
    }
    return quad;
  }
  static _resolveNode(node, url){
    // console.debug(`Resolving node: ${JSON.stringify(node)}`);
    // console.debug(`  with url: ${url}`);
    if(node?.termType === 'Quad')return this._resolve(node);
    if(node?.termType === 'NamedNode')return N3.DataFactory.namedNode(`${IRI.parse(node.value, url)}`);
    if(node?.termType === 'Literal'){
      return N3.DataFactory.literal(
        node.value, 
        node.language === '' ? // literal is not a langstring
          this._resolveNode(node.datatype) :
          node.language
      );
    }
    return node;
  }
}

// static _jsonableToNamedNode(term){
//   if(term.termType !== 'NamedNode')return null;
//   return N3.DataFactory.namedNode(term.value);
// }

// static _jsonableToBlankNode(term){
//   if(term.termType !== 'BlankNode')return null;
//   return N3.DataFactory.blankNode(term.value);
// }

// static _jsonableToLiteral(term){
//   if(term.termType !== 'Literal')return null;
//   const languageOrDatatype = term.language === '' ? N3.DataFactory.namedNode(term.datatype) : term.language;
//   return N3.DataFactory.literal(term.value, languageOrDatatype);
// }

// static _jsonableToDefaultGraph(term){
//   if(term.termType !== 'DefaultGraph')return null;
//   return N3.DataFactory.defaultGraph();
// }

// static _jsonableToQuad(quad){
//   if(quad.termType !== 'Quad')return null;
//   const 
//   subject = (
//     this._jsonableToNamedNode(quad.subject) || this._jsonableToBlankNode(quad.subject) ||
//     this._jsonableToQuad(quad.subject)
//   ),
//   predicate = this._jsonableToNamedNode(quad.predicate),
//   object = (
//     this._jsonableToNamedNode(quad.object) || this._jsonableToBlankNode(quad.object) ||
//     this._jsonableToLiteral(quad.object)
//   ),
//   graph = (
//     this._jsonableToNamedNode(quad.graph) || this._jsonableToBlankNode(quad.graph) ||
//     this._jsonableToDefaultGraph(quad.graph)
//   );
//   return N3.DataFactory.quad(subject,predicate,object,graph); 
// }



class SemanticData extends GenericData {
  /** @ignore */
  static tag = 'semantic';
  /** @ignore */
  _value;

  /** 
   * Builder for [semantic data values](https://qworum.net/en/specification/v1/#semantic). 
   * 
   * @static
   * @param {string} value The semantic data value.
   * @param {(string | undefined)} type The type of the semantic data value. One of 'turtle', 'trig', 'n-triples', 'n-quads'. Default is 'turtle'.
   * @throws {Error}
   * @returns {SemanticData}
   * @see {@link https://qworum.net/en/specification/v1/#semantic|Qworum specification}
   */
  static build() {
      return new SemanticData();
  }
  /** @ignore */
  constructor(){
  // constructor(text){
      super();
      this._value = new RdfDataset();
      // this._value = text;
  }
  get value() {
      return this._value;
  }
  /** @ignore */
  _toString() {
      return this.value;
  }


  /**
   * Async RDF dataset reader.
   * @param {string} text Text in one of these RDF formats: Turtle, TriG, N-Triples, N-Quads
   * @param {(URL|undefined)} baseIRI The URL of the RDF document
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

  /**
   * Async RDF dataset reader.
   * @param {string} text Text in one of these RDF formats: Turtle, TriG, N-Triples, N-Quads
   * @param {(URL|undefined)} baseIRI The URL of the RDF document
   * @returns {Promise.<boolean>}
   * @async
   */
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
  
  /**
   * RDF dataset serialiser.
   * @param {string} type One of: turtle, trig, n-triples, n-quads
   * @returns {string}
   */
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

  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
    const res = this.toRawString().split('\n').map(line => `  ${line}`).join('\n');
    return `SemanticData(\n${res}\n)`;
  }

  /** @ignore */
  static fromJsonable(encodedData) {
      if (!(
        encodedData && 
        typeof encodedData === 'object' && 
        !Array.isArray(encodedData) && 
        encodedData.type === `${SemanticData.namespace} ${SemanticData.tag}` && 
        encodedData.value instanceof Array
      )) throw new Error('not a Jsonable object');
      const res = new SemanticData();

      if (typeof encodedData.value === 'string') { // browser extension doesn't have N3 lib, so parse the text here
        res.readFromText(encodedData.value, new URL(`${encodedData.url}`))
        return res;
      }

      for (const quad of encodedData.value) {
        // // console.debug(`deserialised: ${JSON.stringify(this._jsonableToQuad(quad))}`);
        res.value.add(this._jsonableToQuad(quad));
      }

      return res;
  }

  /** @ignore */
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

  /** @ignore */
  static _jsonableToNamedNode(term){
    if(term.termType !== 'NamedNode')return null;
    return N3.DataFactory.namedNode(term.value);
  }

  /** @ignore */
  static _jsonableToBlankNode(term){
    if(term.termType !== 'BlankNode')return null;
    return N3.DataFactory.blankNode(term.value);
  }
  
  /** @ignore */
  static _jsonableToLiteral(term){
    if(term.termType !== 'Literal')return null;
    const languageOrDatatype = term.language === '' ? N3.DataFactory.namedNode(term.datatype) : term.language;
    return N3.DataFactory.literal(term.value, languageOrDatatype);
  }

  /** @ignore */
  static _jsonableToDefaultGraph(term){
    if(term.termType !== 'DefaultGraph')return null;
    return N3.DataFactory.defaultGraph();
  }

  /** @ignore */
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

  /** @ignore */
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

/** @ignore */
DataValue.registry = [
  Json,
  SemanticData
];

/** @ignore */
class Statement { // instruction or data value
//   static fromJsonable(encodedStatement) {
//       try {
//           const instruction = Instruction.fromJsonable(encodedStatement);
//           return instruction;
//       } catch (error) {}
//       try {
//           const o = DataValue.fromJsonable(encodedStatement);
//           return o;
//       } catch (error1) {}
//       throw new Error('not a statement');
//   }

}

/** @ignore */
class Instruction { // not data value
  static namespace = new URL('https://qworum.net/ns/v1/instruction/');
  static registry = [];
  toString() {
    throw new Error('not implemented');
  }
//   static fromJsonable(encoded) {
//     let errorMessage = 'Not valid instruction';
//     for (const instructionType of this.registry){
//       try {
//         const instruction = instructionType.fromJsonable(encoded);
//         return instruction;
//       } catch (error) {}
//     }
//     throw new Error(errorMessage);
//   }
  toJsonable() {
    throw new Error('not implemented');
  }
}



class Fault extends Instruction {
  /** @ignore */
  static tag = "fault";
  /** @ignore */
  static defaultType = '* service-specific';
  /** @ignore */
  _type;

  /** 
   * Builder for [Fault instructions](https://qworum.net/en/specification/v1/#fault). Suitable for service-specific faults only.
   * 
   * @static
   * @param {(string | undefined)} type The type of the raised fault.
   * @throws {TypeError}
   * @returns {Fault}
   * @example
   * const fault = Fault.build('payment cancelled');
   * @see {@link https://qworum.net/en/specification/v1/#fault|Qworum specification}
   */
  static build(type) { 
    // scripts generated by services can only contain service-specific faults,
    // all others are raised implicity by the runtime.
    return new Fault(type);
  }
  /** @ignore */
  constructor(type){
    super();
    if (!type) {
        type = Fault.defaultType;
    } else if(typeof type !== 'string'){
        throw new TypeError('fault type is not a string');
    } else if(type.match(/^\s*\*/)){
        throw new TypeError(`not a service-specific fault: '${type}'`);
    }
    this._type = type;
  }

  get type() {
      return this._type;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `Fault(type: ${this.type})`;
  }

//   static fromJsonable(encoded) {
//       if (encoded.type !== Fault.tag) throw new Error(`not a ${this.tag}`);
//       return new Fault(this._typefromJsonable(encoded));
//   }
//   static _typefromJsonable(encoded) {
//       if (encoded.type !== Fault.tag) throw new Error(`not a ${this.tag}`);
//       return encoded.value?.type || Fault.defaultType;
//   }
  /** @ignore */
  toJsonable() {
      return {
          type: Fault.tag,
          value: {
              type: this.type
          }
      };
  }
}


class Return extends Instruction {
  /** @ignore */
  static tag = "return";
  /** @ignore */
  statement;

  /** 
   * Builder for [Return instructions](https://qworum.net/en/specification/v1/#return). 
   * 
   * @static
   * @param {(DataValue | Instruction)} statement The instruction or data value to evaluate.
   * @throws {Error}
   * @returns {Return}
   * @example
   * const return1 = Return.build(Json.build(2022));
   * @see {@link https://qworum.net/en/specification/v1/#return|Qworum specification}
   */
  static build(statement) {
      return new Return(statement);
  }
  /** @ignore */
  constructor(statement){
      super();
      if (!statement) throw new Error('statement required');
      this.statement = statement;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `Return(${this.statement})`;
  }
//   static fromJsonable(encoded) {
//       if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
//       return new Return(Statement.fromJsonable(encoded.value.statement));
//   }
  /** @ignore */
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
  /** @ignore */
  static tag = "sequence";
  /** @ignore */
  _statements;

  /** 
   * Builder for [Sequence instructions](https://qworum.net/en/specification/v1/#sequence). 
   * 
   * @static
   * @param {(DataValue | Instruction | Array.<(DataValue | Instruction)>)} statements Statements.
   * @throws {Error}
   * @returns {Sequence}
   * @example
   * const sequence = Sequence.build(Json.build(2022));
   * @see {@link https://qworum.net/en/specification/v1/#sequence|Qworum specification}
   */
  static build(...statements) {
      return new Sequence(...statements);
  }
  /** @ignore */
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
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `Sequence(${this.statements})`;
  }
//   static fromJsonable(encoded) {
//       if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
//       const statements = encoded.value.statements.map((encodedStatement)=>Statement.fromJsonable(encodedStatement));
//       return new Sequence(...statements);
//   }
  /** @ignore */
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
  /** @ignore */
  static tag = "data";
  /** @ignore */
  _path = [];
  /** @ignore */
  statement = null;

  /** 
   * Builder for [Data instructions](https://qworum.net/en/specification/v1/#data). 
   * 
   * @static
   * @param {(string | string[])} path The path of the data container.
   * @param {(DataValue | Instruction | undefined)} statement An instruction or data value.
   * @throws {Error}
   * @returns {Data}
   * @example
   * const data1 = Data.build('data1', Json.build(2022)); // Writing
   * @example
   * const data2 = Data.build('data1'); // Reading
   * @see {@link https://qworum.net/en/specification/v1/#data|Qworum specification}
   */
  static build(path, statement) {
      return new Data(path, statement);
  }
  /** @ignore */
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
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `Data(path: [${this.path.join(', ')}], statement: ${this.statement})`;
  }
//   static fromJsonable(encoded) {
//       if (encoded.type !== Data.tag) throw new Error(`not a ${this.tag}`);
//       if (encoded.value) {
//           if (encoded.value.statement) {
//               return new Data(encoded.value.path, Statement.fromJsonable(encoded.value.statement));
//           }
//       }
//       return new Data(encoded.value.path);
//   }
  /** @ignore */
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
  /** @ignore */
  static tag = "try";
  /** @ignore */
  statement;
  /** @ignore */
  _catchClauses;

  /** 
   * Builder function for [Try instructions](https://qworum.net/en/specification/v1/#try).
   * 
   * @static
   * @param statement A statement (instruction or data value) or a non-empty array of statements.
   * @param catchClauses One catch clause or an array of catch clauses.
   * @throws {Error}
   * @returns {Try} 
   * @example
   * const try1 = Try.build(
   *   Call.build('@', 'checkout/'), 
   *   [
   *     {catch: ['the cart is empty'], do: Json({})}
   *   ]
   * );
   * @see {@link https://qworum.net/en/specification/v1/#try|Qworum specification}
   */
  static build(statement, catchClauses) {
      return new Try(statement, catchClauses);
  }
  /** @ignore */
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
  /** @ignore */
  get catchClauses() {
      return this._catchClauses;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
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

//   static fromJsonable(encoded) {
//       if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
//       const statement = Statement.fromJsonable(encoded.value.statement), catchClauses = encoded.value.catch.map((c)=>({
//               'catch': c.catch,
//               'do': c.do.map((encodedStatement)=>Statement.fromJsonable(encodedStatement))
//           }));
//       return new Try(statement, catchClauses);
//   }
  /** @ignore */
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
    /** @ignore */
  static tag = "goto";

  /** @ignore */
  _href = null;
//   _parameters = [];

  /** 
   * Builder for [Goto instructions](https://qworum.net/en/specification/v1/#goto). 
   * 
   * @static
   * @param {(string | null | undefined)} href The URL of the new call phase. Can be a relative or absolute URL.
   * @throws {Error}
   * @returns {Goto}
   * @example
   * const goto = Goto.build('home/');
   * @see {@link https://qworum.net/en/specification/v1/#goto|Qworum specification}
   */
  static build(href) {
      return new Goto(href);
  }
  /** @ignore */
  constructor(href){
      super();
    //   const parameters = [];
      if (typeof href === 'string') this._href = href;
    //   if (!parameters) return;
    //   const params = parameters instanceof Array ? parameters : [
    //       parameters
    //   ];
    //   for (const value of params.values()){
    //       this._parameters.push(value);
    //   }
  }
  get href() {
      return this._href;
  }
//   get parameters() {
//       return this._parameters;
//   }
//   parameter(name) {
//       const param = this._parameters.find((p)=>p.name === name);
//       if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
//       return param.value;
//   }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
    //   let parameters = null, result = '';
    //   for (const param of this.parameters){
    //       if (parameters === null) {
    //           parameters = '';
    //       } else {
    //           parameters += ', ';
    //       }
    //       parameters += `{name: ${param.name}, value: ${param.value}}`;
    //   }
    //   if (typeof this.href === 'string') {
    //       result += ``;
    //   }
    //   if (typeof parameters === 'string') {
    //       if (result.length > 0) result += ', ';
    //       result += `parameters: [${parameters}]`;
    //   }
    //   return `Goto(href: ${this.href}${result})`;
    return `Goto(href: ${this.href})`;
  }
//   static fromJsonable(encoded) {
//       if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
//       return new Goto(encoded.value.href);
//   }

  /** @ignore */
  toJsonable() {
      return {
          type: Goto.tag,
          value: {
              href: this.href,
            //   parameters: this.parameters.map((param)=>({
            //           name: param.name,
            //           value: param.value.toJsonable()
            //       }))
          }
      };
  }
}


class Call extends Instruction {
  /** @ignore */
  static tag = "call";
  /** @ignore */
  _object = [];
  /** @ignore */
  _href = null;
  /** @ignore */
  _parameters = [];
  /** @ignore */
  _objectParameters = [];

  /** 
   * Builder for [Call instructions](https://qworum.net/en/specification/v1/#call). 
   * 
   * @static
   * @param {(string[] | string | null | undefined)} object The path of the Qworum object to call.
   * @param {(string | null | undefined)} href The URL of the end-point to call. Can be a relative or absolute URL.
   * @param {(object | object[] | null | undefined)} parameters Named data value arguments.
   * @param {(object | object[] | null | undefined)} objectParameters Named Qworum object arguments.
   * @throws {Error}
   * @returns {Call}
   * @example
   * const call1 = Call.build('@', 'home/');
   * @example
   * const call2 = Call.build(
   *   '@', 'home/', 
   *   {name: 'current year', value: Json.build(2022)}
   * );
   * @example
   * const call3 = Call.build(
   *   ['@'], 'home/',
   *   [{name: 'current year', value: Json.build(2022)}],
   *   [{name: 'object', object: ['@', 'a Qworum object']}]
   * );
   * @see {@link https://qworum.net/en/specification/v1/#call|Qworum specification}
   */
  static build(object, href, parameters, objectParameters) {
      return new Call(object, href, parameters, objectParameters);
  }
  /** @ignore */
  constructor(object, href, parameters, objectParameters){
      super();
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
  /** @ignore */
  objectParameter(name) {
      const objectParam = this._objectParameters.find((p)=>p.name === name);
      if (typeof objectParam === 'undefined') throw new Error(`object parameter "${name}" not found`);
      return objectParam.object;
  }
  /** @ignore */
  parameter(name) {
      const param = this._parameters.find((p)=>p.name === name);
      if (typeof param === 'undefined') throw new Error(`parameter "${name}" not found`);
      return param.value;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
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

//   static fromJsonable(encoded) {
//       if (encoded.type !== this.tag) throw new Error(`not a ${this.tag}`);
//       return new Call(encoded.value.object, encoded.value.href, encoded.value.parameters.map((parameter)=>({
//               name: parameter.name,
//               value: Statement.fromJsonable(parameter.value)
//           })), encoded.value.objectParameters);
//   }
  /** @ignore */
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
              objectParameters: this.objectParameters
          }
      };
  }
}


Instruction.registry = [
  Fault,
  Return,
  Sequence,
  Data,
  Try,
  Goto,
  Call
];


class Script {
  /** @ignore */
  static contentType = 'application/xml';
  /** @ignore */
  _instruction;

  /** 
   * Builder for [Qworum scripts](https://qworum.net/en/specification/v1/#script). 
   * 
   * @static
   * @param {Instruction} instruction The root instruction to execute.
   * @returns {Script}
   * @example
   * const script = 
   * Script.build(
   *   Sequence.build(
   *     Call.build(["@", "shopping cart"], "https://shopping-cart.example/view/"),
   *     Goto.build("/home/")
   *   )
   * );
   * @see {@link https://qworum.net/en/specification/v1/#script|Qworum specification}
   */
  static build(instruction) {
      return new Script(instruction);
  }
  /** @ignore */
  constructor(instruction){
      if (!(instruction instanceof Instruction)) throw new Error('one or more parameters required');
      this._instruction = instruction;
  }
  get instruction() {
      return this._instruction;
  }
  /**
   * Serialises the object to string for informational purposes.
   * @returns {string}
   */
  toString() {
      return `${this.instruction}`;
  }
//   static fromJsonable(jsonable){
//     return Script.build(Instruction.fromJsonable(jsonable));
//   }
  /** @ignore */
  toJsonable(){
    return this.instruction.toJsonable();
  }
}

/** @ignore */
const QworumScript = { 
  Json, SemanticData, 

  DataValue, GenericData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
};

export { 
  QworumScript, 

  Json, SemanticData, 

  DataValue, GenericData, 
  Instruction, 
  Return, Sequence, Data, Try, Goto, Call, Script,
  Fault, 
};

