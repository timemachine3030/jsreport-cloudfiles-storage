const { describe, beforeEach, it } = require('mocha');
const config = require('../test.config.json');
const blobStorageInit = require('./main');

describe('main', () => {
  let storage;
  let fakeReporter;
  beforeEach((done) => {
    fakeReporter = {
      logger: {
        error: console.error,
        info: console.log
      },
      options: {
        blobStorage: {
          name: 'pkgcloud-storage'
        }
      },
      blobStorage: {
        registerProvider: function (methods) {
          storage = methods;
          methods.init();
          done();
        }
      }
    };
    blobStorageInit(fakeReporter, { options: config });
  });

  it('loads file to storage container', () => {
    return storage.write('text-filename.txt', Buffer.from('Hello, WOrld!'));
  });
});
