// AppleHealth - схема для выгрузки
const clinicalDocumentReader = (json) => {
  const objects = [];
  // todo дополнить схемой
  json.ClinicalDocument.recordTarget.patientRole;

  return objects;
};

module.exports = (abstract) => {
  const clinicalObjects = clinicalDocumentReader(abstract.json);
  abstract.object.concat(clinicalObjects);
};
