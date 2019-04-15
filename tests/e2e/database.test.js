const { IS_DEV } = require('../../src/env');

const databaseFoods = async (t) => {
  const dbFoods = require('../../src/database/foods.database');
  const rows = await dbFoods.get('actimel ');
  if (IS_DEV) {
    t.log(rows);
  }
  t.true(Array.isArray(rows));
  t.true(rows.length > 0);
  const [firstRow] = rows;
  t.true(firstRow.hasOwnProperty('title'));
  t.true(firstRow.hasOwnProperty('fat'));
  t.true(firstRow.hasOwnProperty('kcal'));
  t.true(firstRow.hasOwnProperty('protein'));
  t.true(firstRow.hasOwnProperty('carbohydrate'));
};

module.exports = {
  databaseFoods,
};
