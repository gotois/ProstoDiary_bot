module.exports = async (t) => {
  t.timeout(4000);
  const foodService = require('../../src/services/food.service');

  const results = await foodService.search('Soup', 2);
  t.true(Array.isArray(results));
  t.is(results.length, 2);

  const rusResult = await foodService.search('Шоколад');
  t.true(rusResult.hasOwnProperty('food_id'));
  t.true(rusResult.hasOwnProperty('food_name'));

  await t.throwsAsync(async () => {
    await foodService.search('SIDJFIOSDFJOSDIJOISDFJ');
  });

  const salatResult = await foodService.search('Салат Греческий', 2);
  t.is(salatResult[0].food_name, 'Greek Salad');

  const idFood = await foodService.get(6284);
  t.is(idFood.food_id, 'string');
  t.is(idFood.food_name, 'string');
  t.is(idFood.food_type, 'string');
  t.true(idFood.food_url.startsWith('https://'));
  t.is(typeof idFood.servings, 'object');
};
