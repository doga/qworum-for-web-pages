
import { 
  IRI, iri,
  IRL, irl,
  URN, urn,
  rdfTerm as t, rdf,
  Language, 
} from '../../../../deps.mjs';

import { RDF, SKOS, QRM } from "./util/rdf-prefixes.mjs";
import { I18nText } from "./util/i18n-text.mjs";
// import { IRI } from "../id.mjs";

/**
 * A user role within a group.
 * Each role belongs to exactly one roleset. The rolesetId prefixes each roleId that belongs to the roleset.
 * All roles that aren't the root role in a roleset have a parent role.
 */
class Role {
  /** @type {IRI} */
  #roleId;
  
  /** @type {I18nText} */
  description;
  
  /** 
   * @type {(Role | null)} 
   **/
  parentRoleId;

  /**
   * @returns {IRI}
   */
  get roleId(){return this.#roleId;}
  
  /**
   * 
   * @param {{roleId: IRI, description: I18nText | undefined, parentRoleId: IRI | undefined}} role 
   */
  constructor(role){
    this.#roleId     = role.roleId;
    this.description = role.description ?? new I18nText();
    this.parentRoleId = role.parentRoleId ?? null;
  }

  /**
   * 
   * @param {object} dataset 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  writeTo(dataset){
    const idTerm = t.namedNode(`${this.roleId}`);

    // type
    dataset.add(
      t.quad(idTerm, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Role`))
    );
    dataset.add(
      t.quad(idTerm, t.namedNode(`${RDF}type`), t.namedNode(`${SKOS}Concept`))
    );

    // parent role
    if(this.parentRoleId){
      dataset.add(
        t.quad(idTerm, t.namedNode(`${QRM}parentRole`), t.namedNode(`${this.parentRoleId}`))
      );
      dataset.add(
        t.quad(idTerm, t.namedNode(`${SKOS}broader`), t.namedNode(`${this.parentRoleId}`))
      );
    }

    // description
    for (const lang of this.description.getLangs()) {
      const text = this.description.getText(lang);
      dataset.add(
        t.quad(idTerm, t.namedNode(`${QRM}description`), t.literal(text, lang.iso639_1))
      );
    }
  }

  /**
   * @returns {object} a dataset
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  toDataset(){
    const dataset = rdf.dataset();
    this.writeTo(dataset);
    return dataset;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {Role[]}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readFrom(dataset){
    const
    res   = [],
    idsDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Role`));

    for (const quad of idsDs) {
      try {
        // read id
        const 
        roleIdTerm = quad.subject,
        roleId     = iri`${roleIdTerm.value}`;

        if(!roleId)throw new Error('not a role id');

        // read description
        const 
        description = new I18nText(),
        descrDs     = dataset.match(roleIdTerm, t.namedNode(`${QRM}description`));
        for (const quad of descrDs) {
          try {
            const 
            textTerm = quad.object,
            text     = textTerm.value,
            lang     = Language.fromCode(textTerm.language.split('-')[0]);

            description.setText(text, lang);
          } catch (error) {
            console.debug(`[Role.readFrom] description error`,error);
          }
        }
        
        // read parent role (one at most)
        const parentRoleIdDs = dataset.match(roleIdTerm, t.namedNode(`${QRM}parentRole`));
        let parentRoleId;
        for (const quad of parentRoleIdDs) {
          try {
            parentRoleId = iri`${quad.object.value}`;
          } catch (error) {
            console.debug(`[Role.readFrom] parent role error`,error);
          }
        }

        res.push(new Role({roleId, description, parentRoleId}));
      } catch (error) {
        console.debug(`[Role.readFrom] `,error);
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(Role|null)}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readOneFrom(dataset){
    try {
      const ids = Role.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

  /**
   * 
   * @param {*} other 
   */
  equals(other){
    if(!(other instanceof Role)) return false;
    return this.roleId.equals(other.roleId);
  }

}


/**
 * A set of roles that are assignable by the managers of group memberships to group members.
 */
class Roleset {
  /** 
   * @type {IRI} 
   **/
  #rolesetId;

  /** @type {Role} */
  #topRole;

  /** @type {Role[]} */
  #roles;
  
  /** @type {I18nText} */
  description;

  /** @returns {IRI} */
  get rolesetId(){return this.#rolesetId;}

  /** @returns {Role} */
  get topRole(){return this.#topRole;}

  /**
   * @returns {Role[]}
   */
  get roles() {return this.#roles;}

  /**
   * @param {({rolesetId: IRI, topRole: Role, roles: Role[] | undefined, description: I18nText | undefined} | undefined)} roleset 
   * @throws {TypeError}
   */
  constructor(roleset) {
    // check arg
    if(!roleset)roleset = {};
    if(!(roleset.roles instanceof Array))roleset.roles = [];

    // check roleset id
    const idEndings = {irl: ['#', '/'], urn: [':']};
    if (!(
      (
        roleset.rolesetId instanceof IRL && 
        idEndings.irl.find(ending =>  `${roleset.rolesetId}`.endsWith(ending))
      ) ||
      (
        roleset.rolesetId instanceof URN && 
        idEndings.urn.find(ending =>  `${roleset.rolesetId}`.endsWith(ending))
      )
    )) throw new TypeError('not a roleset id');

    // check top role
    if (!(
      roleset.topRole instanceof Role && !roleset.topRole.parentRoleId && 
      `${roleset.topRole.roleId}`.startsWith(`${roleset.rolesetId}`)
    )) throw new TypeError('not a top role');

    // check roles
    if (
      !roleset.roles.every(
        r => (
          r instanceof Role && `${r.roleId}`.startsWith(`${roleset.rolesetId}`) &&
          (
            (!r.parentRoleId && r.roleId.equals(roleset.topRole.roleId)) || 
            ( // TODO detect cycles
              r.parentRoleId && roleset.roles.find(r2 => r2.roleId.equals(r.parentRoleId))
            )
          )
        )
      )
    ) throw new TypeError('not a role array for roleset');

    // add top role to roles
    if (!roleset.roles.find(r => r.equals(roleset.topRole))) {
      roleset.roles.push(roleset.topRole);
    }

    // check that non-top roles have the top role as ancestor
    for (const role of roleset.roles) {
      const visited = [role];
      let parentRole = role.parentRole;
      while(parentRole){
        if(parentRole.equals(roleset.topRole))continue;
        // forbid cycles
        if (visited.find(r => r.equals(parentRole))) {
          throw new TypeError('role hierarchy must be a tree, it must not contain cycles');
        }
        visited.push(parentRole);
        parentRole = role.parentRole;
      }
    }

    this.#rolesetId  = roleset.rolesetId;
    this.#topRole    = roleset.topRole;
    this.#roles      = roleset.roles;
    this.description = roleset.description ?? new I18nText();
  }

  /**
   * @param {Role} role
   * @returns {boolean}
   */
  hasRole(role) {
    return this.#roles.find(r => r.equals(role));
  }

  /**
   * Adds a role to the roleset. Returns this same object for call-chaining puroposes.
   * @param {Role} role
   * @returns {Roleset}
   * @throws {TypeError}
   */
  setRole(role) {
    // check arg
    if(!(
      role instanceof Role && `${role.roleId}`.startsWith(`${this.rolesetId}`) &&
      ( // TODO detect cycles
        role.parentRoleId && this.roles.find(r2 => r2.roleId.equals(role.parentRoleId))
      )
    ))throw new TypeError('not a role for this roleset');

    if(role.equals(this.topRole))return this;

    if (this.hasRole(role))return;
    this.#roles.push(role);
    return this;
  }

  /**
   * Removes a non-top role from the roleset. Returns this same object for call-chaining puroposes.
   * @param {Role} role
   * @returns {Roleset}
   */
  unsetRole(role) {
    if (!this.hasRole(role))return this;
    if(role.equals(this.topRole))return this;
    let index;
    for (let i = 0; i < this.#roles.length; i++) {
      const r = this.#roles[i];
      if (r.equals(role)) {
        index = i; break;
      }
    }
    if(!index)return this;
    this.#roles.splice(index,1);
    return this;
  }

  /**
   * Returns a role whose ID matches the call argument.
   * @param {(IRI | Role | RegExp | string)} matcher
   * @returns {(Role | null)}
   * @throws {TypeError}
   */
  findRole(matcher){
    try {
      return this.#roles.find(
        r => (
          (matcher instanceof IRI && r.roleId.equals(matcher)) ||
          (matcher instanceof Role && r.equals(matcher)) ||
          `${r.roleId}`.match(matcher)
        )
      ) ?? null;
    } catch (error) {
      throw new TypeError(`${error}`);
    }
  }

  /**
   * 
   * @param {Role} role 
   * @param {IRI} ancestorRoleId 
   * @returns {(Role | null)}
   * @throws {TypeError}
   */
  findAncestorRole(role, ancestorRoleId){
    if (!(role instanceof Role)) {
      throw new TypeError('not a role');
    }
    if (!(ancestorRoleId instanceof IRI)) {
      throw new TypeError('not a role id');
    }

    let r = role;
    const visited = [];
    while(r){
      // ancestor not found?
      if (!r) return null;

      // detect cycles in roleset
      if (visited.find(id => id.equals(r.roleId))) {
        throw new TypeError(`cycle detected in roleset <${this.rolesetId}> involving role <${r.roleId}>`)
      }
      visited.push(r.roleId);

      // ancestor found?
      if (r.roleId.equals(ancestorRoleId)) return r;

      // check parent
      r = this.findRole(r.parentRoleId);
    }

  }

  /**
   * 
   * @param {object} dataset 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  writeTo(dataset){
    const 
    rolesetIdTerm = t.namedNode(`${this.rolesetId}`),
    topRoleIdTerm = t.namedNode(`${this.topRole.roleId}`);

    // type
    dataset.add(
      t.quad(rolesetIdTerm, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Roleset`))
    );
    dataset.add(
      t.quad(rolesetIdTerm, t.namedNode(`${RDF}type`), t.namedNode(`${SKOS}ConceptScheme`))
    );
    
    // top role
    dataset.add(
      t.quad(rolesetIdTerm, t.namedNode(`${SKOS}hasTopConcept`), topRoleIdTerm)
    );

    // roles
    for (const role of this.roles) {
      role.writeTo(dataset);

      // link role to roleset
      const roleIdTerm = t.namedNode(`${role.roleId}`);

      if(role.equals(this.topRole))
      dataset.add(
        t.quad(roleIdTerm, t.namedNode(`${SKOS}topConceptOf`), rolesetIdTerm)
      );

      dataset.add(
        t.quad(roleIdTerm, t.namedNode(`${SKOS}inScheme`), rolesetIdTerm)
      );
    }

    // description
    for (const lang of this.description.getLangs()) {
      const text = this.description.getText(lang);
      dataset.add(
        t.quad(rolesetIdTerm, t.namedNode(`${QRM}description`), t.literal(text, lang.iso639_1))
      );
    }
  }

  /**
   * @returns {object} a dataset
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  toDataset(){
    const dataset = rdf.dataset();
    this.writeTo(dataset);
    return dataset;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {Roleset[]}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readFrom(dataset){
    const
    res          = [],
    rolesetIdsDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Roleset`));

    for (const quad of rolesetIdsDs) {
      try {
        // read id
        const 
        rolesetIdTerm = quad.subject,
        rolesetId     = iri`${rolesetIdTerm.value}`;

        if(!rolesetId)throw new Error('not a roleset id');

        // read top role id
        const
        topRoleIdDs = dataset.match(rolesetIdTerm, t.namedNode(`${SKOS}hasTopConcept`));

        let topRoleId;
        for (const quad of topRoleIdDs) {
          topRoleId = iri`${quad.object.value}`;
        }
        if(!topRoleId)throw new Error('top role id not indicated for roleset');
        // console.debug(`[Roleset.readFrom] topRoleId`,topRoleId);
        
        // read roles
        const
        roleIdsDs = dataset.match(null, t.namedNode(`${SKOS}inScheme`), rolesetIdTerm),
        roles     = [];

        for (const quad2 of roleIdsDs) {
          const 
          roleId     = iri`${quad2.subject.value}`,
          roleIdTerm = t.namedNode(`${roleId}`),
          roleDs     = dataset.match(roleIdTerm),
          role       = Role.readOneFrom(roleDs);

          if(role)roles.push(role);
        }

        const
        topRole = roles.find(r => r.roleId.equals(topRoleId));

        // console.debug(`[Roleset.readFrom] roles`,roles);

        if(!topRole)throw new Error('top role not found in roleset');

        // read description
        const 
        description = new I18nText(),
        descrDs     = dataset.match(rolesetIdTerm, t.namedNode(`${QRM}description`));
        for (const quad2 of descrDs) {
          try {
            const 
            textTerm = quad2.object,
            text     = textTerm.value,
            lang     = Language.fromCode(textTerm.language.split('-')[0]);

            description.setText(text, lang);
          } catch (error) {
            console.debug(`[Roleset.readFrom] description error`,error);
          }
        }
        // console.debug(`[Roleset.readFrom] description`,description);

        // create roleset
        const roleset = new Roleset({rolesetId, topRole, roles, description});
        // console.debug(`[Roleset.readFrom] roleset`,roleset);

        res.push(roleset);
      } catch (error) {
        console.debug(`[Roleset.readFrom] `,error);
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(Roleset|null)}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readOneFrom(dataset){
    try {
      const ids = Roleset.readFrom(dataset);
      if (ids.length === 0) {
        console.debug(`[Roleset] readOneFrom: no roleset`);
        return null;
      }
      return ids[0];
    } catch (_error) {
      console.debug(`[Roleset] readOneFrom`, _error);
      return null;
    }
  }

  /**
   * 
   * @param {*} other 
   */
  equals(other){
    if(!(other instanceof Roleset)) return false;
    return this.rolesetId.equals(other.rolesetId);
  }
}


const
en = Language.fromCode('en'),

rolesetId = iri`${QRM}id/roleset/general/`,

description = new I18nText().setText('The default roleset for Qworum services.', en),

topRole   = new Role({
  roleId     : iri`${rolesetId}top`,
  description: new I18nText().setText('The user can perform any action within the group.', en)
}),

writerRole =   new Role({
  roleId      : iri`${rolesetId}writer`,
  parentRoleId: topRole.roleId,
  description : new I18nText().setText('The user can create, read, update and delete group-owned data.', en)
}),

defaultRoleset = new Roleset({rolesetId, topRole, description})
.setRole(writerRole)
.setRole(
  new Role({
    roleId      : iri`${rolesetId}upserter`,
    parentRoleId: writerRole.roleId,
    description : new I18nText().setText('The user can create and update and read group-owned data, but not delete the data.', en)
  })
)
.setRole(
  new Role({
    roleId      : iri`${rolesetId}reader`,
    parentRoleId: writerRole.roleId,
    description : new I18nText().setText('The user can read group-owned data.', en)
  })
)
.setRole(
  new Role({
    roleId      : iri`${rolesetId}drafter`,
    parentRoleId: topRole.roleId,
    description : new I18nText().setText('The user can create, read, update and delete persona-owned data. The main use case is the drafting of documents before making them available to the group.', en)
  })
);


export {Role, Roleset, defaultRoleset};
