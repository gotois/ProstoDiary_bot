module.exports = async (t) => {
  t.timeout(3000);
  const foursquareService = require('../../src/services/foursquare.service');
  // ll example
  const data = await foursquareService.search({
    ll: '40.7,-74',
    query: 'sushi',
    limit: 10,
  });
  t.log(data);

  // near example
  // const data = await foursquareService.search({
  //   near: 'Москва',
  //   query: 'tacos',
  //   limit: 10,
  // });
  // t.log(data);

  // const venue = await foursquareService.venueDetail({
  //   type: "venueDetail",
  //   id: "51e047a2498e5ba705b278f7"
  // });
  // t.log(venue)
};
