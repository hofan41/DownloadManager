'use strict';

var Path = require('path');

exports.updateReadme = function(request, reply) {
    var self = this;
    var objectName = request.params.downloadName + 'README.md';

    return this.s3.putTextObject(objectName, 'public-read', request.payload.content, request.auth.credentials.profile.displayName)
        .then(function() {

            // Return status OK to host
            reply.continue();

            // Wait for the object to be added
            return self.s3.waitFor('objectExists', objectName);

        }).then(function() {

            // Notify other clients via socket.io
            request.server.methods.refreshReadmeFile(request.params.downloadName, request.payload.content);

        }).catch(function(err) {
            return reply({
                message: err.message
            }).code(400);
        });
};

exports.downloadsList = function(request, reply) {
    // listBucket only returns 1000 items. 
    // Need to update this function to retrieve all items > 1000.
    return this.s3.listBucketDirectories().then(function(directories) {
        return reply({
            data: directories
        });
    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.fileList = function(request, reply) {
    var downloadName = request.params.downloadName;
    return this.s3.listFiles(downloadName).then(function (files) {

        var prunedFiles = [];
        // Remove the folder name itself from the file list.
        for (var i = 0; i < files.length; ++i) {
            if (files[i].Key !== downloadName && files[i].Key !== downloadName + 'README.md') {
                prunedFiles.push(files[i]);
            }
        }

        return reply({
            data: prunedFiles
        });
    }).catch(function(err) {
        
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.createNewDownload = function(request, reply) {
    var self = this;

    var downloadName = request.payload.downloadName + '/';

    return this.s3.createDownload(downloadName)
        .then(function() {

            // Return status OK to host
            reply.continue();

            // Wait for the object to be added
            return self.s3.waitFor('objectExists', downloadName);

        }).then(function() {

            // Notify other clients via socket.io
            request.server.methods.refreshDownloadList();

        }).catch(function(err) {
            return reply({
                message: err.message
            }).code(400);
        });
};

exports.getSignedPutDownloadUrl = function(request, reply) {
    var self = this;

    var downloadName = request.params.downloadName + '/';

    return this.s3.doesDownloadExist(downloadName).then(function(downloadExists) {
        if (downloadExists === true) {
            return self.s3.getSignedPutObjectUrl(downloadName +
                request.query.s3ObjectName,
                request.query.s3ObjectType,
                request.auth.credentials.profile.displayName);
        } else {
            throw new Error('Download does not exist!');
        }
    }).then(function(url) {
        return reply({
            signedRequest: url
        });
    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.downloadFile = function(request, reply) {
    var fileName = request.params.downloadName;

    return this.s3.getSignedGetObjectUrl(fileName).then(function (url) {

        reply.redirect(url);

    }).catch(function(err) {

        return reply({
            message: err.message
        }).code(400);
    });
};

exports.deleteFile = function(request, reply) {
    var self = this;

    var fileName = request.params.downloadName;
    return this.s3.doesDownloadExist(fileName).then(function(fileExists) {
        if (fileExists === true) {
            return self.s3.deleteObject(fileName);
        } else {
            throw Error('Download does not exist!');
        }
    }).then(function() {

        // Return status OK to host
        reply.continue();

        // Wait until the object has been deleted
        return self.s3.waitFor('objectNotExists',
            fileName);

    }).then(function() {

        // Notify other clients via socket.io
        request.server.methods.refreshDownloadFileList(Path.parse(request.params.downloadName).dir);

    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.deleteDownload = function(request, reply) {
    var self = this;

    var downloadName = request.params.downloadName;

    if (downloadName.slice(-1) != '/') {
        return exports.deleteFile.call(this, request, reply);
    }

    // Retrieve all of the files related to the downloadName
    return this.s3.listFiles(downloadName).then(function(files) {
        var deleteFiles = [];
        // Retrieve only the Key field from the file
        // since aws rejects requests that contain unknown fields.
        files.forEach(function(file) {
            deleteFiles.push({
                Key: file.Key
            });
        });

        return self.s3.deleteObjects({
            Delete: {
                Objects: deleteFiles
            }
        });

    }).then(function() {

        // Return status OK to host
        reply.continue();

        // Wait until the object has been deleted
        return self.s3.waitFor('objectNotExists',
            downloadName);

    }).then(function() {

        // Notify other clients via socket.io
        request.server.methods.refreshDownloadList();

    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });

};