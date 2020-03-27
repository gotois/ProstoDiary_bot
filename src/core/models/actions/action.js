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
 * "Что?" тип AbstractAction, UserAction, BotAction, NaturalAction
 */
class Action {
  /**
   * @param {string} intent - dialogflowResult intent displayName
   * @returns {string}
   */
  constructor(intent) {
    this.type = convertIntentToActionName(intent);
    // todo научить разбираться какой статус произошел по контексту; обновлять его внутри СУБД
    this.status = 'CompletedActionStatus'; // ActiveActionStatus, PotentialActionStatus
  }
}

module.exports = Action;
