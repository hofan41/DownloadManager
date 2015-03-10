var Promise = require('promise');
var AWS = require('aws-sdk-promise');
var Hoek = require('hoek');
var s3 = new AWS.S3();

var internals = {};

internals.s3 = new AWS.S3();

internals.defaultS3Params = {
  Bucket: process.env.AWS_S3_BUCKET
};

internals.downloadNameAlreadyExistsError = function() {
  throw new Error('Download already exists in the system!');
};

internals.defaultError = function(err) {
  console.log(err);
  throw err;
};

exports.validateSettings = internals.validateSettings = function(callback) {
  return internals.s3.headBucket(internals.defaultS3Params).promise().then(function() {
    console.log('Download manager successfully connected to aws bucket: ' + internals.defaultS3Params.Bucket);
  }, function(err) {
    console.log('Download manager could not access aws bucket: ' + internals.defaultS3Params.Bucket);
    console.log(JSON.stringify(err));
    throw err;
  });
};

exports.createDownload = internals.createDownload = function(downloadName, descriptionText) {
  var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
    Key: downloadName
  });

  return internals.headObject(downloadName).then(internals.downloadNameAlreadyExistsError,
    function(err) {
      // If the error is that the object does not exist
      if (err.code === 'NotFound') {
        // Add the object
        return internals.s3.putObject(Hoek.applyToDefaults(s3Params, {
          Metadata: {
            Description: descriptionText
          }
        })).promise().then(function(data) {
          // Wait for the object to be added
          return internals.s3.waitFor('objectExists', s3Params).promise();
        });
      } else {
        // If the error is some other problem, throw it.
        internals.defaultError(err);
      }
    });
};

exports.headObject = internals.headObject = function(downloadName) {
  var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
    Key: downloadName
  });

  return internals.s3.headObject(s3Params).promise();
};

exports.getObject = internals.getObject = function(downloadName) {
  var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
    Key: downloadName + '/'
  });

  return internals.s3.getObject(s3Params).promise();
};

exports.listBucket = internals.listBucket = function() {
  return internals.s3.listObjects(internals.defaultS3Params).promise();
};