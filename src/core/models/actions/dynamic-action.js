const dialogService = require('../../../services/dialog.service'); // в моделях не должно быть сервисов
const dynamicThing = require('../things/dynamic');

function convertIntentToActionName(intent) {
  switch (intent) {
    case 'EatIntent': {
      return 'EatAction';
    }
    case 'BuyIntent': {
      return 'BuyAction';
    }
    case 'FinanceIntent': {
      return 'AchieveAction';
    }
    case 'FitnessIntent': {
      return 'ExerciseAction';
    }
    case 'TodoIntent': {
      return 'PlanAction';
    }
    case 'WorkIntent': {
      return 'CreateAction';
      // todo
      //  здесь же может быть акт перехода (MoveAction).
      //  пример: "пошел на работу в офис"
      //  MoveAction
    }
    // case 'InstallIntent': {
    // xxx
    // }
    // case 'PainIntent': {
    // todo https://schema.org/MedicalSymptom
    // break;
    // }
    // case 'WeightIntent': {
    // todo
    // break;
    // }
    // например когда "посмотрел фильм"
    // case 'WatchAction': {
    //   break;
    // }
    // настроение
    // case 'AssessAction': {
    //   break;
    // }
    // ??
    // это когда бот подключен к сторонним группам в телеграм
    // case 'InteractAction': {
    //   break;
    // }
    // case 'PlayAction': {
    //   break;
    // }
    // case 'SearchAction': {
    //   break;
    // }
    // пример работы с финансами
    // case 'TradeAction': {
    //   break;
    // }
    default: {
      return 'Action';
    }
  }
}
/**
 * @param {string} intent - dialogflowResult intent displayName
 * @returns {object} - JSON-LD action
 */
module.exports = async ({ text }) => {
  if (text.length > 256) {
    throw new Error('So big for detect');
  }
  // todo возможно исключение, надо его правильно обработать
  // todo поменять uid
  const dialogflowResult = await dialogService.detect(text, 'test-uid');
  const parameters = dialogService.formatParameters(dialogflowResult);
  const type = convertIntentToActionName(dialogflowResult.intent.displayName);

  return {
    '@context': {
      schema: 'http://schema.org/',
      object: 'schema:object',
      subjectOf: 'schema:subjectOf',
      // для валидации schema - todo перенести в сервисы и повторно использовать
      ...Object.keys(parameters).reduce((accumulator, k) => {
        accumulator[k] = 'schema:' + k;
        return accumulator;
      }, {}),
    },
    '@type': type,
    'object': dynamicThing({
      ...parameters,
      // inLanguage: 'xxx' // язык
    }),
    'subjectOf': [],
    // todo научить разбираться какой статус произошел по контексту; обновлять его внутри СУБД
    // actionStatus: 'CompletedActionStatus'; // ActiveActionStatus, PotentialActionStatus,
  };
};
