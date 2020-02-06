const { sql } = require('../db/database');

module.exports = {
  selectCategories(categories) {
    return sql`
    SELECT * FROM story WHERE
    ARRAY[${sql.array(categories, 'text')}] @> ARRAY[categories]
    `;
    // todo `AND created_at between '2019-12-15' AND '2019-12-15'`
  },
  // @deprecated
  selectCategory(intentName) {
    return sql`
    SELECT * FROM story WHERE
    '{${sql.identifier([intentName])}}' <@ categories
    `;
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
  selectStory() {
    return sql`SELECT
    *
FROM
    story
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
  selectStoryByDate({ publisherEmail, from = '2000-01-01', until, sorting }) {
    if (!until) {
      // todo раньше был sql.raw('now()') но он перестал работать
      until = 'now()';
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
       WHERE publisher_email = ${publisherEmail}
       AND created_at BETWEEN ${from} AND ${until}
       ${orderBy}
       `;
  },
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
            ${context},
            ${contentId}
          )
          RETURNING id`;
  },
  createContent({
    content,
    contentType,
    emailMessageId,
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
            email_message_id,
            telegram_message_id,
            message_id,
            schema
          )
          VALUES (
            ${sql.binary(content)},
            ${contentType},
            ${date.toUTCString()}::timestamptz,
            ${emailMessageId},
            ${telegramMessageId},
            ${messageId},
            ${schema}
          )
          RETURNING id
          `;
  },
  createMessage({ creator, publisher, version, experimental = false }) {
    return sql`
          INSERT INTO story.message
          (
            creator,
            publisher,
            version,
            experimental
          )
          VALUES (
          ${creator},
          ${publisher},
          ${version},
          ${experimental}
          )
          RETURNING id
          `;
  },
};
