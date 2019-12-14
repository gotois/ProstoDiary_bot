const { sql } = require('../core/database');

module.exports = {
  refreshView() {
    return sql`
REFRESH MATERIALIZED VIEW public.story
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
