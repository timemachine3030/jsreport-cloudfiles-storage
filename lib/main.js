'use strict';
const pkgcloud = require('pkgcloud');
const q = require('q');
const Stream = require('stream');

function Storage (options) {
  this.client = pkgcloud.storage.createClient(options.connection);
  this.options = options;
}

Storage.prototype.init = function (reporter) {
  this.reporter = reporter;
  return q.ninvoke(this.client, 'createContainer', this.options.container);
};

Storage.prototype.read = function (blobName) {
  return q.ninvoke(this.client, 'download', this.options.container, blobName);
};

Storage.prototype.write = function (blobName, buffer) {
  this.reporter.logger.info('Writing file to cloud storage: ' + blobName);
  const stream = this.client.upload({
    container: this.options.container,
    remote: blobName
  });
  stream.write(buffer);
  return stream;
};

Storage.prototype.remove = function (blobName) {
  return q.ninvoke(this.client, 'removeFile', this.options.container, blobName);
};

module.exports = function (reporter, definition) {
  let options = {};
  let enabled = false;
  if (reporter.options.blobStorage &&
      reporter.options.blobStorage.name &&
      reporter.options.blobStorage.name.toLowerCase() === 'pkgcloud-storage'
  ) {
    options = reporter.options.blobStorage;
    enabled = true;
  }

  if (Object.getOwnPropertyNames(definition.options).length) {
    options = definition.options;
    enabled = true;
  }

  if (!enabled) {
    return;
  }

  options.container = options.container || 'jsreport';

  if (!options.connection) {
    throw new Error('connection settings must be provided to jsreport-pkgcloud-storage');
  }

  if (!options.connection.provider) {
    throw new Error('provider must be provided to jsreport-pkgcloud-storage');
  }

  const store = new Storage(options);

  reporter.blobStorage.registerProvider({
    init: () => {
      store.init(reporter);
    },
    read: async (blobName) => {
      try {
        return store.read(blobName);
      } catch (err) {
        const r = Stream.Readable();
        process.nextTick(() => r.emit('error', err));
      }
    },
    write: async (blobName, buffer) => {
      return new Promise((resolve, reject) => {
        const stream = store.write(blobName, buffer);
        stream.on('log::warn', reporter.logger.info);
        stream.once('error', (err) => {
          reporter.logger.error('Error writing to cloud storage: ' + options.connection.provider);
          return reject(err);
        });

        stream.once('success', (file) => {
          reporter.logger.info('Saved file to cloud storage', file.name);
          return resolve(blobName);
        });
        stream.end();
      });
    },
    remove: (blobName) => {
      return store.remove(blobName);
    }
  });
};
