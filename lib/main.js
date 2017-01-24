'use strict';
var pkgcloud = require('pkgcloud');
var q = require('q');
var Stream = require('stream');

function Storage (options) {
  this.client = pkgcloud.storage.createClient(options.connection);
  this.options = options;
}

Storage.prototype.init = function (reporter) {
  this.reporter = reporter;
  return q.ninvoke(this.client, 'createContainer', this.options.container);
};

Storage.prototype.read = function (blobName, cb) {
  var stream = this.client.download(this.options.container, blobName);
  cb(null, stream);
};

Storage.prototype.write = function (blobName, buffer, cb) {
  var reporter = this.reporter;
  reporter.logger.info('Writing file to cloud storage: ' + blobName);
  var stream = this.client.upload({
      container: this.options.container,
      remote: blobName
  });

  stream.once('error', function (err) {
    reporter.logger.error('Error saving to cloud');
    return cb(err);
  });
  stream.once('success', function (file) {
    reporter.logger.info('Saved file to cloud');
    return cb(null, file.name);
  });

  var bufferStream = new Stream.PassThrough();
  bufferStream.end(buffer);
  bufferStream.pipe(stream);
};

module.exports = function (reporter, definition) {
  var options = {};
  var enabled = false;
  if (reporter.options.blobStorage &&
      reporter.options.blobStorage.name &&
      reporter.options.blobStorage.name.toLowerCase() === 'pkgcloud-storage'
  ) {
    options = reporter.options.blobStorage;
    enabled = true;
  }

  if (Object.getOwnPropertyNames(definition.options).length) {
    options = definition.options;
    // just temporary fix for current jsreport-core, remove afterwards
    reporter.options.blobStorage = {name: 'pkgcloud-storage'};
    enabled = true;
  }

  if (!enabled) {
    return;
  }

  options.container = options.container || 'jsreport';

  if (!options.connection) {
    throw new Error('provider must be provided to jsreport-pkgcloud-storage');
  }

  if (!options.connection.provider) {
    throw new Error('provider must be provided to jsreport-pkgcloud-storage');
  }

  reporter.blobStorage = new Storage(options);
  return reporter.blobStorage.init(reporter);
};
