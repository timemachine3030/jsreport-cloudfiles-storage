'use strict';
var pkgcloud = require('pkgcloud');
var q = require('q');

function Storage (options) {
  this.blobService = pkgcloud.storage.createClient(options.connection);
  this.options = options;
}

Storage.prototype.init = function () {
  return q.ninvoke(this.blobService, 'createContainer', this.options.container);
};

Storage.prototype.read = function (blobName, cb) {
  var stream = this.blobService.download(this.options.container, blobName);
  cb(null, stream);
  return stream;
};

Storage.prototype.write = function (blobName, buffer, cb) {
  var stream = this.blobService.upload({
      container: this.options.container,
      remote: blobName
  });

  stream.once('error', function (err) {
     return cb(err);
  });
  stream.once('success', function (file) {
      return cb(null, file.name);
  });

  buffer.pipe(stream);
  return stream;
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
  return reporter.blobStorage.init();
};
