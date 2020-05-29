const { getGeoCode } = require('../../services/location.service');

module.exports = async (abstract) => {
  const [geocode] = await getGeoCode(abstract.latlng);
  if (geocode) {
    const streetAddress = geocode.address_components.find((address) => {
      {
        return address.types.includes('route');
      }
    });
    const postalCode = geocode.address_components.find((address) => {
      return address.types.includes('postal_code');
    });
    const addressCountry = geocode.address_components.find((address) => {
      return address.types.includes('country');
    });
    const addressLocality = geocode.address_components.find((address) => {
      return address.types.includes('locality');
    });
    const addressRegion = geocode.address_components.find((address) => {
      return address.types.includes('sublocality');
    });
    abstract.address = {
      '@type': 'PostalAddress',
      'addressCountry': addressCountry.short_name,
      'addressLocality': addressLocality.short_name,
      'addressRegion': addressRegion.short_name,
      'postalCode': postalCode.short_name,
      'streetAddress': streetAddress.short_name,
    };
    abstract.name = geocode.formatted_address;
  }
  abstract.object.push({
    '@type': 'Place',
    'name': `${abstract.latlng.latitude},${abstract.latlng.longitude}`,
    'address': abstract.address,
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': abstract.latlng.latitude,
      'longitude': abstract.latlng.longitude,
    },
  });
};
