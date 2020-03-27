module.exports = (request, response) => {
  response.type('text/plain');
  response.send(
    `
    User-agent: *
    Disallow: /
    SITEMAP: https://prosto-diary.herokuapp.com/sitemap.txt
    `.trim(),
  );
};
