CREATE TABLE IF NOT EXISTS passport.assistant (
id UUID NOT NULL DEFAULT gen_random_uuid(),

-- todo
-- jurisdiction JSONB, -- Intended jurisdiction for operation definition (if applicable);
-- todo электронная подпись сгенерированная ботом, которая подтверждает что бот не был скомпроментирован. todo: попробвать через `MD5('string');`?
-- sign SOMEHASH

updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
created_at TIMESTAMP DEFAULT current_timestamp,
email TEXT NOT NULL,
UNIQUE (email)
);

GRANT ALL ON TABLE passport.bot TO bot;
