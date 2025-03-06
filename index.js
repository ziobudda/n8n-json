'use strict';

const { JsonStorage, jsonStorage } = require('./nodes/JsonStorage/jsonStorage.node');

module.exports = {
  nodeTypes: [
    {
      description: {
        displayName: 'JSON Storage',
        name: 'jsonStorage',
        group: ['transform'],
        version: 1,
        description: 'Store and retrieve key-value pairs in a JSON file',
        defaults: {
          name: 'JSON Storage',
        },
        inputs: ['main'],
        outputs: ['main'],
      },
      type: JsonStorage
    },
  ],
};