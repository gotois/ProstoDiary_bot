CREATE USER bot WITH ENCRYPTED PASSWORD '0000';
GRANT ALL PRIVILEGES ON DATABASE storydb TO bot;

  -- fixme добавить роли
  -- demo - демо роль, ничего не сохраняет, работает в песочнице
  -- bot - привязанная к пользователю роль, имеет список ограничений
  -- oracle - суперпользователь, или оракул, который отвечает за выгрузки, когда бот не имеет достаточно прав
