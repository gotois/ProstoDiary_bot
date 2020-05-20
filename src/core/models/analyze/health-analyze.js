const healthData = (json) => {
  const objects = [];

  // todo странные данные - возможно дополнить в схему
  // json.HealthData.Me;

  json.HealthData.ClinicalRecord.map((record) => {
    return {
      '@type': 'MedicalEntity',
      'name': record.type,
      'identifier': record.identifier,
      'description': record.sourceName,
      'url': record.sourceURL,
      // fhirVersion: '1.0.2',
      // receivedDate: '2018-12-18 14:06:24 -0600',
    };
  }).forEach((record) => {
    objects.push(record);
  });
  return objects;
};

module.exports = (abstract) => {
  const healthObjects = healthData(abstract.json);
  abstract.object.concat(healthObjects);
};
