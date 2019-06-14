module.exports = async (t) => {
  t.timeout(3000);
  const geoCodeService = require('../../src/services/geocode.service');
  const parsedDataResults = await geoCodeService.getGeoCode({
    latitude: 37.787679,
    longitude: -122.409713,
  });
  t.true(Array.isArray(parsedDataResults));
  t.true(!!parsedDataResults[0].address_components);
  t.true(!!parsedDataResults[0].formatted_address);
  t.true(!!parsedDataResults[0].geometry);
  t.true(!!parsedDataResults[0].place_id);
};
