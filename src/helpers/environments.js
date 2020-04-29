/**
 * @param {object} object - environments
 * @returns {string}
 */
const convertEnvironmentObjectToString = (object) => {
  return Object.keys(object)
    .reduce((accumulator, key) => {
      if (object[key]) {
        let data;
        switch (typeof object[key]) {
          case 'object': {
            data = JSON.stringify(object[key]);
            break;
          }
          default: {
            data = object[key];
            break;
          }
        }
        const value = key.toUpperCase() + '=' + data;
        accumulator.push(String(value));
      }
      return accumulator;
    }, [])
    .join('\n');
};

module.exports = {
  convertEnvironmentObjectToString,
};
