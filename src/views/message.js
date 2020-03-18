module.exports = ({ storyTable }) => {
  let html = '';

  html += `<h1>${JSON.stringify(storyTable.categories)}</h1>`;
  html += `<h2>${JSON.stringify(storyTable.context)}</h2>`;
  switch (storyTable.content_type) {
    case 'text/plain':
    case 'plain/text': {
      html += storyTable.content.toString();
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
    <div>
      <p>STATUS: ${storyTable.status}</p>
      <p>created_at: ${storyTable.created_at}</p>
    </div>
  `;

  return html;
};
