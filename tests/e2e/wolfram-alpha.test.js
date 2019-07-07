module.exports = async (t) => {
  t.timeout(5000);
  const dateFns = require('date-fns');
  const waApi = require('../../src/services/wolfram-alpha.service');

  const fullOutput = await waApi.getFull({
    input: 'today',
    output: 'json',
    format: 'plaintext',
  });
  for (let pod of fullOutput.pods) {
    if (pod.id === 'SingleDateFormats') {
      const date = new Date(pod.subpods[0].plaintext);
      t.true(dateFns.isValid(date));
    }
  }
  // TODO: short output
  // const shortOutput = const result = await waApi.getShort('today');
  // t.log(fullOutput)

  // TODO: Personal Health (помощь в расчитывании веса, медианы по графикам, помощь по оптимальным калориям уже съеденного, ...)
  // TODO: Finance (Stock Data - уведомление об изменении цены акций в портфеле)
};
