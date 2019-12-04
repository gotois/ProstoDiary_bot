module.exports = async (t) => {
  t.timeout(3000);
  const foursquareService = require('../../src/lib/foursquare');
  // ll example
  const llData = await foursquareService.search({
    ll: '40.7,-74',
    query: 'sushi',
    limit: 10,
  });
  t.true(Array.isArray(llData.venues));

  // near example
  const nearData = await foursquareService.search({
    near: 'Москва',
    limit: 1,
  });
  t.true(Array.isArray(nearData.venues));

  // const venue = await foursquareService.venueDetail({
  //   type: "venueDetail",
  //   id: "51e047a2498e5ba705b278f7"
  // });
  // t.log(venue)
};
