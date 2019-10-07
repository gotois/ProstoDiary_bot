/**
 * @module types
 */
/**
 * @description StoryJSON накладывается как бы поверх source документов и представляет собой лишь связи между этими документами.
 * @typedef {object} storyJSON
 *
 * Story
 * @property {buffer} source - crypto raw source (video|audio|text|photo|document)
 * @property {object} context - контекст который сформировал бот. Здесь хранится вся топология
 * @property {string} context.type - input type (soft|hard|core)
 * @property {string} context.intent - The intent (Abstract to Natural)
 * @property {string} context.parameters
 * @property {string} context.languageCode
 * @property {string} context.sentiment
 * @property {string} context.hrefs
 * @property {string} context.entities
 * @property {string} context.emails
 * @property {string} context.phones
 * @property {string} context.category
 * @property {geoJSON} context.place
 * @property {SmartDate} context.date - from until date
 * @property {*} context. ... - ...
 *
 * BOT
 * @property {number} telegram_message_id - The telegram_message_id
 * @property {number} telegram_user_id - The telegram_user_id
 * @property {JSON} jurisdiction - законы ограничивающие выдачу информации другим ботам
 * @property {string} version - API supported version
 * @property {string} publisher - The bot publisher
 *
 * User
 * @property {JSON} author - The author JSON-LD
 */
/**
 * @module types
 */
/**
 * @typedef {object} JsonRpc
 * @property {*|undefined} result - result
 * @property {object|undefined} error - error
 */
/**
 * @module types
 */
/**
 * @typedef {object} jsonld
 * @property {string} name - name
 * @property {string} email - email
 */
/**
 * @module types
 */
/**
 * @typedef {object} TelegramMessage
 * @property {object} chat - chat
 * @property {object} from - from
 * @property {string} text - text
 * @property {any} voice - voice
 * @property {any} document - document
 * @property {Array<object>} photo - photo
 * @property {object} location - location
 * @property {string} caption - caption
 * @property {object} reply_to_message - message
 * @property {number} message_id - id message
 * @property {number} date - unix time
 */
/**
 * @module types
 */
/**
 * @typedef {string} Tag - tag enum
 */
/**
 * @module types
 */
/**
 * @typedef {object} Mail - mail
 * @property {any} html - html
 * @property {Array<object>} attachments - attachments
 * @property {any} text - text
 * @property {any} subject - subject
 * @property {any} to - to
 * @property {any} receivedData - receivedData
 * @property {any} messageId - messageId
 * @property {any} priority - priority
 * @property {any} flags - flags
 * @property {any} receivedData - receivedData
 */
