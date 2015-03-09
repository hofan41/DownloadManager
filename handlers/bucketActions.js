var AWS = require('aws-sdk');
var Hoek = require('hoek');
var s3 = new AWS.S3();

var internals = {};

internals.defaultS3Params = {
  Bucket: process.env.AWS_S3_BUCKET
};

internals.putObjectCallback = function(err, data, reply, s3Params, that) {
  if (err) {
    reply(err);
  } else {
    reply.continue();
    s3.waitFor('objectExists', s3Params, function(err, data) {
      if (data) {
        that.io.emit('putObject');
      } else {
        // Not tested, need to test to figure out what happens.
        throw err;
      }
    });
  }
};

exports.validateSettings = internals.validateSettings = function(callback) {
  s3.headBucket(internals.defaultS3Params, function(err, data) {
    if (err) {
      console.log('Download manager could not access aws bucket: ' + internals.defaultS3Params.Bucket);
      console.log(JSON.stringify(err));
    } else {
      console.log('Download manager successfully connected to aws bucket: ' + internals.defaultS3Params.Bucket);
    }
    return callback(err, data);
  });
};

exports.createFolder = internals.createFolder = function(request, reply) {
  var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
    Key: request.payload.downloadName + '/'
  });

  // TODO : Figure out some way to do the putObjectCallback better instead of passing
  // this around.
  var that = this;

  // Test if the object already exists
  s3.headObject(s3Params, function(err, data) {
    // We are looking for an error.
    if (err) {
      // If the error is that the object does not exist
      if (err.code === 'NotFound') {
        // Add the object
        s3.putObject(s3Params, function(err, data) {
          internals.putObjectCallback(err, data, reply, s3Params, that);
        });
      } else {
        // If it's some other type of error during getObject, throw programmer error.
        reply(err);
      }
    } else {
      // If there was no error in getObject, then the object already exists. Throw user error.
      reply({
        message: 'Download name already exists in the system!'
      }).code(400);
    }
  });
};

exports.listBucket = internals.listBucket = function(request, reply) {
  s3.listObjects(internals.defaultS3Params, function(err, data) {
    if (err) {
      // Throw programmer error
      reply(err);
    } else {
      reply({
        data: data.Contents
      });
    }
  });
};