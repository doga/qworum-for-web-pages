import { IRL, URN, rdfTerm as t, rdf, } from '../../../../deps.mjs';
import ttg from "./util/tagged-template-generator.mjs";
import { RDF, QRM } from "./util/rdf-prefixes.mjs";

const
PREFIX           = 'urn:qworum',
ENTITY_ID_FORMAT = /^[a-fA-F0-9-]{30,50}$/;

class Id extends URN {
  /** @type {string} */ idType;
  /** @type {string} */ bareId; 

  /**
   * 
   * @param {string} idString 
   */
  constructor(idString) {
    super(idString);
    const 
    typeAndId = this.namespaceSpecific.split(':'),
    idType    = typeAndId.shift(),
    bareId    = typeAndId.join(':');

    this.idType   = idType;
    this.bareId   = bareId;
  }

  /**
   * 
   * @param {string} idType 
   * @param {(string | string[])} bareId 
   * @returns {Id}
   * @throws {TypeError}
   */
  static create(idType, bareId) {
    if (bareId instanceof Array) {
      bareId = bareId.join(':');
    }
    const id = new Id(`${PREFIX}:${idType}:${bareId}`);
    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');
    return id;
  }

  /**
   * 
   * @param {string} idType 
   * @returns {Id}
   */
  static uuid(idType) {
    const
    bareId = crypto.randomUUID(),
    id     = new Id(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   * @param {string} rdfType 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  writeTo(dataset, rdfType){
    dataset.add(
      t.quad(t.namedNode(this.toString()), t.namedNode(`${RDF}type`), t.namedNode(`${rdfType}`))
    );
  }

  /**
   * 
   * @param {string} rdfType 
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  toDataset(rdfType){
    const dataset = rdf.dataset();
    dataset.add(t.quad( t.namedNode(this.toString()), t.namedNode(`${RDF}type`), t.namedNode(`${rdfType}`) ));
    return dataset;
  }

  /**
   * 
   * @param {object} dataset 
   * @param {string} rdfType 
   * @returns {Id[]}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readFrom(dataset, rdfType){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${rdfType}`));

    for (const quad of matchDs) {
      try {
        const 
        id = new Id(quad.subject.value);
        if(!id)throw new Error('not an id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @param {string} rdfType 
   * @returns {(Id|null)}
   * @see {@link https://rdf.js.org/dataset-spec/#datasetcore-interface | DatasetCore interface}
   */
  static readOneFrom(dataset, rdfType){
    try {
      const ids = Id.readFrom(dataset, rdfType);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}


class OrgId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'org') throw new TypeError('invalid entity type for org');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {OrgId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new OrgId(`${PREFIX}:${'org'}:${bareId}`);
  }

  /**
   * 
   * @returns {OrgId}
   */
  static uuid() {
    const
    idType = 'org',
    bareId = crypto.randomUUID(),
    id     = new OrgId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}Org`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}Org`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {OrgId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Org`));

    for (const quad of matchDs) {
      try {
        const 
        id = new OrgId(quad.subject.value);
        if(!id)throw new Error('not an org id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(OrgId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = OrgId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}


class UserId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'user') throw new TypeError('invalid entity type for user');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {UserId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new UserId(`${PREFIX}:${'user'}:${bareId}`);
  }

  /**
   * 
   * @returns {UserId}
   */
  static uuid() {
    const
    idType = 'user',
    bareId = crypto.randomUUID(),
    id     = new UserId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }


  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}User`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}User`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {UserId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}User`));

    for (const quad of matchDs) {
      try {
        const 
        id = new UserId(quad.subject.value);
        if(!id)throw new Error('not a user id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(UserId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = UserId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}


class PasswordId extends Id { // TODO make this an IRL?
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'password') throw new TypeError('invalid entity type for password');
  }

  /**
   * 
   * @param {UserId} userId 
   * @returns {PasswordId}
   * @throws {TypeError}
   */
  static forUser(userId) {
    if (!(userId instanceof UserId)) {
      throw new TypeError('userId must be a UserId');
    }
    return new PasswordId(`${PREFIX}:${'password'}:${userId.bareId}`);
  }
}



class GroupId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'group') throw new TypeError('invalid entity type for group');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {GroupId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new GroupId(`${PREFIX}:${'group'}:${bareId}`);
  }

  /**
   * 
   * @returns {GroupId}
   */
  static uuid() {
    const
    idType = 'group',
    bareId = crypto.randomUUID(),
    id     = new GroupId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}Group`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}Group`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {GroupId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Group`));

    for (const quad of matchDs) {
      try {
        const 
        id = new GroupId(quad.subject.value);
        if(!id)throw new Error('not a group id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(GroupId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = GroupId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}

class MembershipId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'membership') throw new TypeError('invalid entity type for membership');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {MembershipId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new MembershipId(`${PREFIX}:${'membership'}:${bareId}`);
  }

  /**
   * 
   * @returns {MembershipId}
   */
  static uuid() {
    const
    idType = 'membership',
    bareId = crypto.randomUUID(),
    id     = new MembershipId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}Membership`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}Membership`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {MembershipId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Membership`));

    for (const quad of matchDs) {
      try {
        const 
        id = new MembershipId(quad.subject.value);
        if(!id)throw new Error('not a membership id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(MembershipId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = MembershipId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}

class PartnershipId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'partnership') throw new TypeError('invalid entity type for partnership');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {PartnershipId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new PartnershipId(`${PREFIX}:${'partnership'}:${bareId}`);
  }

  /**
   * 
   * @returns {PartnershipId}
   */
  static uuid() {
    const
    idType = 'partnership',
    bareId = crypto.randomUUID(),
    id     = new PartnershipId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}Partnership`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}Partnership`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {PartnershipId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}Partnership`));

    for (const quad of matchDs) {
      try {
        const 
        id = new PartnershipId(quad.subject.value);
        if(!id)throw new Error('not a partnership id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(PartnershipId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = PartnershipId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}

class PartnershipMembershipId extends Id {
  /**
   * 
   * @param {string} idString 
   * @throws {TypeError}
   */
  constructor(idString) {
    super(idString);
    if(this.idType !== 'partnership-membership') throw new TypeError('invalid entity type for partnership-membership');
  }

  /**
   * 
   * @param {string} bareId 
   * @returns {PartnershipMembershipId}
   * @throws {TypeError}
   */
  static create(bareId) {
    return new PartnershipMembershipId(`${PREFIX}:${'partnership-membership'}:${bareId}`);
  }

  /**
   * 
   * @returns {PartnershipMembershipId}
   */
  static uuid() {
    const
    idType = 'partnership-membership',
    bareId = crypto.randomUUID(),
    id     = new PartnershipMembershipId(`${PREFIX}:${idType}:${bareId}`);

    if(!id.bareId.match(ENTITY_ID_FORMAT)) throw new TypeError('invalid entity id format');

    return id;
  }

  /**
   * 
   * @param {object} dataset 
   */
  writeTo(dataset){
    super.writeTo(dataset, `${QRM}PartnershipMembership`);
  }

  /**
   * 
   */
  toDataset(){
    return super.toDataset(`${QRM}PartnershipMembership`);
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {PartnershipMembershipId[]}
   */
  static readFrom(dataset){
    const
    res = [],
    matchDs = dataset.match(null, t.namedNode(`${RDF}type`), t.namedNode(`${QRM}PartnershipMembership`));

    for (const quad of matchDs) {
      try {
        const 
        id = new PartnershipMembershipId(quad.subject.value);
        if(!id)throw new Error('not a partnership-membership id');
        res.push(id);
      } catch (_error) {
      }
    }
    return res;
  }

  /**
   * 
   * @param {object} dataset 
   * @returns {(PartnershipMembershipId|null)}
   */
  static readOneFrom(dataset){
    try {
      const ids = PartnershipMembershipId.readFrom(dataset);
      if (ids.length === 0) {
        return null;
      }
      return ids[0];
    } catch (_error) {
      return null;
    }
  }

}

/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(OrgId | null)}
 **/
const org_id = ttg(OrgId);


/** 
 * Tagged template parser for org IDs.
 * @returns {(OrgId | null)} 
 **/
function bareorg_id(strings, ...values){
  let res = strings[0], i=1; 
  for (const v of values){
    res+=`${v}${strings[i]}`;i++;
  }
  try {
    return OrgId.create(res);
  } catch (_error) {
    return null;
  }
}


/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(GroupId | null)}
 **/
const group_id = ttg(GroupId);


/** 
 * Tagged template parser for group IDs.
 * @returns {(GroupId | null)} 
 **/
function baregroup_id(strings, ...values){
  let res = strings[0], i=1; 
  for (const v of values){
    res+=`${v}${strings[i]}`;i++;
  }
  try {
    return GroupId.create(res);
  } catch (_error) {
    return null;
  }
}



/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(PartnershipId | null)}
 **/
const partnership_id = ttg(PartnershipId);




/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(PartnershipMembershipId | null)}
 **/
const partnership_membership_id = ttg(PartnershipMembershipId);




/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(PartnershipId | null)}
 **/
const membership_id = ttg(MembershipId);



/** 
 * Tagged template parser for partnership IDs.
 * @returns {(PartnershipId | null)} 
 **/
function barepartnership_id(strings, ...values){
  let res = strings[0], i=1; 
  for (const v of values){
    res+=`${v}${strings[i]}`;i++;
  }
  try {
    return PartnershipId.create(res);
  } catch (_error) {
    return null;
  }
}


/** 
 * Tagged-template parser.
 * @type {function} 
 * @param {string} stringValue
 * @returns {(UserId | null)}
 **/
const user_id = ttg(UserId);



/** 
 * Tagged template parser for user IDs.
 * @returns {(UserId | null)} 
 **/
function bareuser_id(strings, ...values){
  let res = strings[0], i=1; 
  for (const v of values){
    res+=`${v}${strings[i]}`;i++;
  }
  try {
    return UserId.create(res);
  } catch (_error) {
    return null;
  }
}


export { 
  Id, OrgId, GroupId, UserId, PasswordId, MembershipId, PartnershipId, PartnershipMembershipId,
  org_id, group_id, user_id, membership_id, partnership_id, partnership_membership_id,
  bareorg_id, baregroup_id, bareuser_id, barepartnership_id,
};
