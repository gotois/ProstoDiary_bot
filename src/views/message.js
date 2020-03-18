module.exports = (storyTable) => {
  const action = storyTable.categories;
  const jsonld = storyTable.context;

  let html = '';
  html += `<h1>${JSON.stringify(action)}</h1>`;
  html += `<pre>${JSON.stringify(jsonld, null, 2)}</pre>`;
  switch (storyTable.content_type) {
    case 'text/plain':
    case 'plain/text': {
      html += `<p><b>RAW</b>: ${storyTable.content.toString()}</p>`;
      break;
    }
    case 'image/jpeg': {
      html += `<img src="data:image/jpeg;base64, ${storyTable.content.toString(
        'base64',
      )}"/>`;
      break;
    }
    default: {
      html += 'ERROR undefined type story';
      break;
    }
  }
  html += `
    <p><b>STATUS</b>: ${storyTable.status}</p>
    <p><b>CREATED</b>: ${storyTable.created_at}</p>
  `;

  return html;
};
