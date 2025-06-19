
import { Language } from '../../../../../deps.mjs';

/**
 * Text that is available in several languages.
 */
class I18nText {
  /** @type {Array<{lang: Language, text: string}>} */
  #value;
  
  /**
   */
  constructor(){
    this.#value = [];
  }
  
  /**
   * 
   * @param {string} text
   * @param {Language} lang
   * @returns {I18nText} the same object (for chaining method calls) 
   * @throws {TypeError}
   */
  setText(text, lang){
    if (!(lang instanceof Language && typeof text === 'string')) {
      throw new TypeError("bad lang or text");
    }

    const entry = this.#value.find(e => e.lang.iso639_1 === lang.iso639_1);

    if (entry) {
      entry.text = text;
    } else {
      this.#value.push({lang, text})
    }

    return this;
  }

  /**
   * 
   * @param {Language} lang
   * @returns {(string | null)}
   * @throws {TypeError}
   */
  getText(lang){
    if (!(lang instanceof Language)) {
      throw new TypeError("bad lang");
    }

    const entry = this.#value.find(e => e.lang.iso639_1 === lang.iso639_1);

    if (!entry) {
      return null;
    }
    return entry.text;
  }

  /**
   * 
   * @returns {Language[]}
   */
  getLangs(){
    return this.#value.map(e => e.lang);
  }

}

export default {I18nText};
export {I18nText};
