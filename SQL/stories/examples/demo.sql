INSERT INTO public.abstract(
	type, tags, mime, version, user, publisher, context)
	VALUES ('soft', '{"eat"}', 'text/sql', '0.0.0', '{"foo": 12}', 'test', '{"foo": 12}'::jsonb
);
