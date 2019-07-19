const databaseFoods = async (t) => {
  const { IS_DEV } = require('../../src/env');
  const dbFoods = require('../../src/database/foods.database');
  const rows = await dbFoods.get('actimel ');
  if (IS_DEV) {
    t.log(rows);
  }
  t.true(Array.isArray(rows));
  t.true(rows.length > 0);
  const [firstRow] = rows;
  t.true(Object.prototype.hasOwnProperty.call(firstRow, 'title'));
  t.true(Object.prototype.hasOwnProperty.call(firstRow, 'fat'));
  t.true(Object.prototype.hasOwnProperty.call(firstRow, 'kcal'));
  t.true(Object.prototype.hasOwnProperty.call(firstRow, 'protein'));
  t.true(Object.prototype.hasOwnProperty.call(firstRow, 'carbohydrate'));
};

module.exports = {
  databaseFoods,
};
