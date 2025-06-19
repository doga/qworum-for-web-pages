
import { iri } from "../../../../../deps.mjs";

const
RDF    = iri`http://www.w3.org/1999/02/22-rdf-syntax-ns#`,
RDFS   = iri`http://www.w3.org/2000/01/rdf-schema#`,
XSD    = iri`http://www.w3.org/2001/XMLSchema#`,
DCE    = iri`http://purl.org/dc/elements/1.1/`,
SKOS   = iri`http://www.w3.org/2004/02/skos/core#`,
SCHEMA = iri`https://schema.org/`,
VCARD  = iri`http://www.w3.org/2006/vcard/ns#`,
QRM    = iri`https://vocab.qworum.net/`;

export default {
  RDF, RDFS, XSD, DCE, 
  SKOS, SCHEMA, VCARD, 
  QRM, 
};

export {
  RDF, RDFS, XSD, DCE, 
  SKOS, SCHEMA, VCARD, 
  QRM, 
};
