module.exports = (bot, message) => {
  console.log("inline action");
  if (message.location) {
    console.log(message.location.latitude);
    console.log(message.location.longitude);
  }
  const results = [];
  // example
  results.push({
    id: 1,
    type: "article",
    title: "+79999991122",
    description: "Номер Ивана",
    thumbnail_url: "",
    input_message_content: { message_text: "article 1" },
  });
  results.push({
    id: 2,
    type: "article",
    title: "+78889991121",
    description: "Номер Василия",
    input_message_content: { message_text: "article 2" },
  });

  return bot.answerInlineQuery(message.id, results, {
    is_personal: true,
    cache_time: 10,
  });
};
