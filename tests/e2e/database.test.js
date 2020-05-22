// fixme в ассистента
const databaseFoods = async (t) => {
  const { IS_PRODUCTION } = require('../../src/environment');
  // fixme path
  const databaseFoods_ = require('../../src/db/foods.database');
  const rows = await databaseFoods_.get('actimel ');
  // todo: test show
  if (!IS_PRODUCTION) {
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
