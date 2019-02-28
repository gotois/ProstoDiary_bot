module.exports = (t) => {
  const {
    getMoney,
    getMedian,
    TYPES,
  } = require('../../src/services/calc.service');

  {
    t.is(getMedian([100, 200, 900, 900]), 550);
  }

  // TODO: getFormatMoney
  // getMoney
  {
    t.deepEqual(
      getMoney({
        texts: [1, 2, '0', 'sdlfjsdlfjsldkfj'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 0,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: ['Поел 300 рыбу', '+ ЗП 1 \n\nsad', 'nuff said'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 300,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: [
          'Поел мясо 100р',
          'Магаз 100.20₽',
          'Магаз 100р.',
          '20.11р магазин',
        ],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 320.31,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: [
          'Поел 0.1р',
          'some 0.1₽',
          'some x 0.112',
          'еще 0.1 \n и еще 0.1',
        ],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 0.512,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: ['Поел 300', 'Магазин 100', 'Зп 999'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 400,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: ['+ ЗП 300', 'что-то еще'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 0,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: [
          'что-то отправил 300рублей ',
          'Поел джаганнат за 200',
          'получил 100р',
        ],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 500,
        usd: 0,
      },
    );
    t.deepEqual(
      getMoney({
        texts: [
          'поел 300 100р 100',
          'Магаз 11€',
          'Поел макароны выпил пива 7.5€',
        ],
        type: TYPES.allSpent,
      }),
      {
        eur: 18.5,
        rub: 500,
        usd: 0,
      },
    );

    t.deepEqual(
      getMoney({
        texts: ['Поел 238. Острые крылышки и байтс'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 238,
        usd: 0,
      },
    );

    t.deepEqual(
      getMoney({
        texts: ['150₽ для прохода в парк', 'Вес63.9'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 150,
        usd: 0,
      },
    );

    t.deepEqual(
      getMoney({
        texts: ['Магаз €1.7 €0.5'],
        type: TYPES.allSpent,
      }),
      {
        eur: 2.2,
        rub: 0,
        usd: 0,
      },
    );

    t.deepEqual(
      getMoney({
        texts: ['Купил билет на обратно ~11500'],
        type: TYPES.allSpent,
      }),
      {
        eur: 0,
        rub: 11500,
        usd: 0,
      },
    );

    // TODO test
    // t.deepEqual(getMoney({
    //   texts: [
    //     'Игра престолов 2,3серия',
    //     'Посмотрел рик и морти 3сезон3серия',
    //     'Обменял валюту по курсу58.9'
    //   ],
    //   type: TYPES.allSpent,
    // }), {
    //   eur: 0,
    //   rub: 0,
    //   usd: 0,
    // });
  }
  // received
  {
    t.deepEqual(
      getMoney({
        texts: [
          'ЗП 300рублей ',
          'зп 10 евро',
          'зарплата $10',
          'зарплата $10.50',
          'зп 200 рублей',
          'зарплата 100руб',
          'получил 100',
          'Водка 50',
          'Bamboos 1€',
          'Магаз 11€',
          'ЗП €100 за сентябрь',
        ],
        type: TYPES.allReceived,
      }),
      {
        eur: 110,
        rub: 700,
        usd: 20.5,
      },
    );
    t.deepEqual(
      getMoney({
        texts: ['ЗП ~1050$'],
        type: TYPES.allReceived,
      }),
      {
        eur: 0,
        rub: 0,
        usd: 1050,
      },
    );
    t.deepEqual(
      getMoney({
        texts: ['ЗП 5\n ЗП 5'],
        type: TYPES.allReceived,
      }),
      {
        eur: 0,
        rub: 10,
        usd: 0,
      },
    );
  }
};
