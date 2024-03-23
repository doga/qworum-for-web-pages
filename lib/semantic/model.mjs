import * as prefixes from './prefixes.mjs';
import { SemanticData } from '../qworum-script.mjs';

class Model {
  /** 
   * Well-known RDF named node prefixes.
   * @type {Object.<string, string>} 
   **/
  static wellKnownPrefixes = prefixes;

  /** 
   * @type {SemanticData[]} 
   * @ignore
   **/
  #semanticData;

  /** 
   * Initially each model instance has one single ID.
   * More IDs can be added later on when reading RDF data that contain `schema:sameAs` properties for the initial ID.
   * @type {Set.<string>} 
   * @ignore
   **/
  #ids;

  /** 
   * @param {string} id - The value of an RDF named node.
   * @param {SemanticData[]} semanticData - Semantic data value for Qworum. Has an in-memory N3.Store.
   **/
  constructor(id, semanticData) {
    if(typeof id !== 'string')throw new TypeError('not an id');

    if (semanticData) {
      if (!(semanticData instanceof Array)) {
        semanticData = [semanticData];
      }
      if (!semanticData.every(s => s instanceof SemanticData))throw new TypeError('not a semantic data');
    }

    this.#semanticData = semanticData ?? [];
    this.#ids          = new Set([id]);
  }

  /** 
   * @return {SemanticData[]} 
   **/
  get semanticData() { return this.#semanticData; }

  /** 
   * @return {Set.<string>} 
   **/
  get ids() { return this.#ids; }
  

  /** 
   * Checks if both models share at least one same ID.
   * @param {Model} model
   * @return {boolean} 
   **/
  isSameAs(model){
    if(!(model instanceof Model))return false;
    for (const [id,_] of this.ids.entries()) {
      if(model.ids.has(id))return true;
    }
    return false;
  }
  

  /** 
   * @return {string} 
   **/
  toString(){
    let res;
    for (const [id,_] of this.ids.entries()) {
      if (res) {
        res += '\n';
      } else {
        res = '';
      }
      res += id;
    }
    return res;
  }
}

export { Model };
