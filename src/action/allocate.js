module.exports = ({ result, agent, participant, mainEntity }) => {
  return {
    '@type': 'AllocateAction',
      'name': this.command,
      'result': {
        '@type': 'CreativeWork',
        'abstract': this.abstract,
        'encodingFormat': 'text/plain',
        'mainEntity': this.objectMainEntity,
      },
  }
};
