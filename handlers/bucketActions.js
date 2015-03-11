var AWS = require('aws-sdk-promise');
var Hoek = require('hoek');

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

internals.getParams = function(downloadName, descriptionText) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: downloadName
    });

    if (descriptionText) {
        s3Params.Metadata = {
            Description: descriptionText
        };
    }

    return s3Params;
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
    return internals.headObject(downloadName).then(internals.downloadNameAlreadyExistsError, function(err) {
        // If the error is that the object does not exist
        if (err.code === 'NotFound') {
            // Add the object
            return internals.putObject(downloadName, descriptionText);
        } else {
            // If the error is some other problem, throw it.
            internals.defaultError(err);
        }
    });
};

exports.putObject = internals.putObject = function(downloadName, descriptionText) {
    var s3Params = internals.getParams(downloadName, descriptionText);

    return internals.s3.putObject(s3Params).promise();
};

exports.waitFor = internals.waitFor = function(event, downloadName) {
    var s3Params = internals.getParams(downloadName);

    return internals.s3.waitFor(event, s3Params).promise();
};

exports.headObject = internals.headObject = function(downloadName) {
    var s3Params = internals.getParams(downloadName);

    return internals.s3.headObject(s3Params).promise();
};

exports.getObject = internals.getObject = function(downloadName) {
    var s3Params = internals.getParams(downloadName);

    return internals.s3.getObject(s3Params).promise();
};

exports.listBucket = internals.listBucket = function() {
    return internals.s3.listObjects(internals.defaultS3Params).promise();
};

exports.deleteObject = internals.deleteObject = function(downloadName) {
    var s3Params = internals.getParams(downloadName);

    return internals.s3.deleteObject(s3Params).promise();
};