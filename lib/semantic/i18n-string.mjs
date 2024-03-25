// A class for representing RDF strings.

import { rdf, xsd } from "./prefixes.mjs";
import { Language } from "../../imports.mjs";

// BUG xsd:string must not have a language tag (so isn't an I18nString?) https://www.w3.org/TR/turtle/#turtle-literals
// xsd:string ➜ https://www.w3.org/TR/2014/REC-rdf11-concepts-20140225/#xsd-datatypes
// rdf:langString ➜ https://www.w3.org/TR/rdf11-schema/#ch_langstring

class I18nString {
  /** 
  * @param {{datatype?:{value:string},value?:string,language?:string}} rdfString
  * @returns {(I18nString|null)}
  **/
  static fromRdfLiteral(rdfString) {
    if (!(
      rdfString.datatype && 
      [`${rdf}langString`, `${xsd}string`].includes(rdfString.datatype.value) 
    )) return null;

    const lang = 
      rdfString.language.length > 0 ? 
      Language.fromCode(rdfString.language) : 
      null;
    return new I18nString(rdfString.value, lang);
  }

  /**
   * @type {string}
   **/ 
  #value;

  /**
   * @type {(Language|null)}
   **/ 
  #lang;

  /** 
  * @param {string} value
  * @param {(Language|string|null|undefined)} lang
  * @throws {TypeError}
  **/
  constructor(value, lang) {
    if (!(typeof value === 'string')) {
      throw new TypeError('Bad I18nString value');
    }
    if (typeof lang === 'string') {
      lang = Language.fromCode(lang);
    }
    if (lang && !(lang instanceof Language))
      throw new TypeError('Bad I18nString language');
    if (!lang) lang = null;
    this.#value = value;
    this.#lang = lang;
  }

  get value() { return this.#value; }
  get lang() { return this.#lang; }
  toString() { return this.value; }
}

export { I18nString };
