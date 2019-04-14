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

  const satalResult = await foodService.search('Салат Греческий', 2);
  t.is(satalResult[0].food_name, 'Greek Salad');
};
