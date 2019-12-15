const { sql } = require('../core/database');

module.exports = {
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
  selectStoryByDate({
    publisherEmail,
    from = '2000-01-01',
    until = sql.raw('now()'),
    sorting,
  }) {
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
  }) {
    return sql`
          INSERT INTO story.content
          (
            content,
            content_type, 
            created_at,
            email_message_id,
            telegram_message_id,
            message_id
          )
          VALUES (
            ${sql.binary(content)}, 
            ${contentType}, 
            ${date.toUTCString()}::timestamptz,
            ${emailMessageId},
            ${telegramMessageId},
            ${messageId}
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
