const { sql } = require('../sql');

module.exports = {
  // fixme нужно фильтровать и отдавать те где publisherEmail равен автору
  selectThing(name) {
    return sql`
    SELECT * FROM story.abstract AS abstract
    LEFT JOIN story.content AS content ON abstract.content_id = content.id
    WHERE context ->> 'name' = ${name}
   `;
  },
  // fixme нужно фильтровать и отдавать те где publisherEmail равен автору
  selectCategories(categories) {
    return sql`
    SELECT * FROM story WHERE
    ARRAY[${sql.array(categories, 'text')}] @> ARRAY[categories]
    `;
    // todo `AND created_at between '2019-12-15' AND '2019-12-15'`
  },
  /**
   * refresh materialized view
   *
   * @returns {*}
   */
  refreshView() {
    return sql`REFRESH MATERIALIZED VIEW public.story
`;
  },
  // fixme нужно фильтровать и отдавать те где publisherEmail равен автору
  selectLatestStories(limit) {
    return sql`
SELECT
    *
FROM
    public.story
LIMIT ${Number(limit)}
`;
  },
  selectStoryById(id) {
    return sql`
SELECT
    *
FROM
    public.story
WHERE
    id = ${id}
`;
  },
  /**
   * @param {object} parameters - parameters
   * @param {string} parameters.creator - creator email
   * @param {string} parameters.from - like '2000-01-01'
   * @param {string} parameters.to - like '2000-01-01'
   * @returns {*}
   */
  selectCreatorStoryByDate({ creator, from, to }) {
    return sql`SELECT * FROM story
       WHERE creator = ${creator}
       AND created_at BETWEEN ${from} AND ${to}
       `;
  },
  /**
   * @param {object} parameters - parameters
   * @param {string} parameters.publisher - publisher email
   * @param {string} [parameters.from] - default '2000-01-01'
   * @param {string} [parameters.to] - to date
   * @param {string} [parameters.sorting] - sorting
   * @returns {*}
   */
  selectPublisherStoryByDate({ publisher, from = '2000-01-01', to, sorting }) {
    if (!to) {
      // todo раньше был sql.raw('now()') но он перестал работать
      to = 'now()';
    }
    let orderBy;
    // hack - при проброске напрямую возникает ошибка
    if (sorting === 'DESC') {
      orderBy = sql`ORDER BY
    created_at DESC
`;
    } else {
      orderBy = sql`ORDER BY
    created_at ASC
`;
    }
    return sql`SELECT * FROM story
       WHERE publisher = ${publisher}
       AND created_at BETWEEN ${from} AND ${to}
       ${orderBy}
       `;
  },
  // сохранение JSONLD типов
  createAbstract({ category, context, contentId }) {
    return sql`
          INSERT INTO story.abstract
          (
            category,
            context,
            content_id
          )
          VALUES (
            ${category},
            ${sql.json(context)},
            ${contentId}
          )
          RETURNING id`;
  },
  // Сохранение первичных бинарных данных
  createContent({
    content,
    contentType,
    // emailMessageId,
    date,
    telegramMessageId,
    messageId,
    schema,
  }) {
    return sql`
          INSERT INTO story.content
          (
            content,
            content_type,
            created_at,
            telegram_message_id,
            message_id,
            schema
          )
          VALUES (
            ${sql.binary(content)},
            ${contentType},
            ${date.toUTCString()}::timestamptz,
            ${telegramMessageId},
            ${messageId},
            ${schema}
          )
          RETURNING id
          `;
  },
  createMessage({
    creator,
    namespace,
    publisher,
    version,
    experimental = false,
  }) {
    return sql`
          INSERT INTO story.message
          (
            namespace,
            creator,
            publisher,
            version,
            experimental
          )
          VALUES (
          ${namespace},
          ${creator},
          ${publisher},
          ${version},
          ${experimental}
          )
          RETURNING id
          `;
  },
};
