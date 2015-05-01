'use strict';

var Promise = require('promise');
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

exports.validateSettings = internals.validateSettings = function() {
    return internals.s3.headBucket(internals.defaultS3Params).promise();
};

exports.createDownload = internals.createDownload = function(downloadName) {
    return internals.doesDownloadExist(downloadName).then(function(
        downloadExists) {
        if (downloadExists === true) {
            internals.downloadNameAlreadyExistsError();
        } else {
            return internals.putEmptyObject(downloadName);
        }
    });
};

exports.doesDownloadExist = internals.doesDownloadExist = function(
    downloadName) {
    return internals.headObject(downloadName)
        .then(function() {
                return true;
            },
            function(err) {
                // If the error is that the object does not exist
                if (err.code === 'NotFound') {
                    // Add the object
                    return false;
                } else {
                    // If the error is some other problem, throw it.
                    internals.defaultError(err);
                }
            });
};

exports.putEmptyObject = internals.putEmptyObject = function(objectName) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: objectName
    });

    return internals.s3.putObject(s3Params).promise();
};

exports.putTextObject = internals.putTextObject = function(objectName, acl, data, author) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: objectName,
        ACL: acl,
        Body: data,
        Metadata: {
            Author: author
        }
    });

    return internals.s3.putObject(s3Params).promise();
};

exports.waitFor = internals.waitFor = function(event, downloadName) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: downloadName
    });

    return internals.s3.waitFor(event, s3Params).promise();
};

exports.headObject = internals.headObject = function(downloadName) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: downloadName
    });

    return internals.s3.headObject(s3Params).promise();
};

exports.listBucketDirectories = internals.listBucketDirectories = function() {
    return internals.listBucket({
        Delimiter: '/'
    }).then(function(response) {
        return response.data.CommonPrefixes;
    });
};

exports.listFiles = internals.listFiles = function(downloadName) {
    return internals.listBucket({
        Prefix: downloadName,
        Delimiter: '/'
    }).then(function(response) {
        return response.data.Contents;
    });
};

exports.listBucket = internals.listBucket = function(params) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, params);

    return internals.s3.listObjects(s3Params).promise();
};

exports.deleteObjects = internals.deleteObjects = function(params) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, params);

    return internals.s3.deleteObjects(s3Params).promise();
};

exports.deleteObject = internals.deleteObject = function(downloadName) {
    var s3Params = Hoek.applyToDefaults(internals.defaultS3Params, {
        Key: downloadName
    });

    return internals.s3.deleteObject(s3Params).promise();
};

exports.getSignedPutObjectUrl = internals.getSignedPutObjectUrl = function(
    downloadName, contentType, author) {
    var s3Params = {
        Key: downloadName,
        ContentType: contentType,
        Expires: 60,
        Metadata: {
            Author: author
        }
    };

    return internals.getSignedUrl('putObject', s3Params);
};

exports.getSignedGetObjectUrl = internals.getSignedGetObjectUrl = function(
    downloadName) {
    var s3Params = {
        Key: downloadName,
        Expires: 60
    };

    return internals.getSignedUrl('getObject', s3Params);
};

internals.getSignedUrl = function(operation, s3Params) {
    return new Promise(function(accept, reject) {
        var newS3Params = Hoek.applyToDefaults(internals.defaultS3Params,
            s3Params);

        // aws-sdk-promise does not work on this function because getSignedUrl 
        // specifies a "synchronous" version that takes in two parameters.
        internals.s3.getSignedUrl(operation, newS3Params, function(
            err, url) {
            if (err) {
                reject(err);
            } else {
                accept(url);
            }
        });
    });
};