module.exports = {
  name: 'pgkcloud-storage',
  main: './lib/main.js',
  dependencies: [],
  optionsSchema: {
    blobStorage: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: [
            'amazon',
            'azure',
            'google',
            'hp',
            'openstack',
            'rackspace'
          ]
        }
      }
    },
    extensions: {
      'pgkcloud-storage': {
        type: 'object'
      }
    }
  }
};
