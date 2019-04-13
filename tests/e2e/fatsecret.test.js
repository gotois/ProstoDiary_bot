const { IS_DEV } = require('../../src/env');

module.exports = async (t) => {
  t.timeout(4000);
  const foodService = require('../../src/services/food.service');

  const results = await foodService.search('Soup', 2);
  t.true(Array.isArray(results.foods.food));
  t.is(results.foods.food.length, 2);

  // TODO: убрать из флага, когда будет поддержка на CI - Translate
  if (IS_DEV) {
    const rusResult = await foodService.search('Шоколад');
    t.true(rusResult.foods.food.hasOwnProperty('food_id'));
    t.true(rusResult.foods.food.hasOwnProperty('food_name'));
    t.is(rusResult.foods.max_results, '1');
  }
};
