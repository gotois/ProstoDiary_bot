module.exports = {
  // показать все съеденное url
  getAllEat() {
    return `
prefix schema:  <http://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?url where {
  ?s ?p ?o ;
     rdf:type schema:EatAction .
  ?s schema:object ?o .
  ?o schema:url ?url
}
LIMIT 10
    `;
  },
};
