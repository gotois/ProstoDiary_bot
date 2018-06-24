module.exports = t => {
  const {formatQuery} = require('../src/services/text.service');
  t.is(typeof formatQuery, 'function');
  
  // spaces
  t.is(formatQuery`  text `, 'text');
  t.is(formatQuery`  some`, 'some');
  
  // rub
  t.is(formatQuery`123 рублей`, '123 ₽');
  t.is(formatQuery`2 евро`, '2 €');
  t.is(formatQuery`20 евро`, '20 €');
  t.is(formatQuery`9 доллара`, '9 $');
  
  // todo few whitespaces
  // t.is(formatQuery`123    рублей`, '123 ₽');
  
  // dot
  t.is(formatQuery`.5`, '0.5');
  t.is(formatQuery`1.5`, '1.5');
  t.is(formatQuery`.1 .2 .3`, '0.1 0.2 0.3');
  t.is(formatQuery`some .5`, 'some 0.5');
  
  // full
  t.is(formatQuery` Мороженное .3 руб`, 'Мороженное 0.3 ₽');
  
};
