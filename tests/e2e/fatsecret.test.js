module.exports = async (t) => {
  t.timeout(2000);
  const foodService = require('../../src/services/food.service');
  const results = await foodService.search('Soup', 2);
  t.true(Array.isArray(results.foods.food));
  t.is(results.foods.food.length, 2);
};
