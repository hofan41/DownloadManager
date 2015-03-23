'use strict';

exports.downloadsList = function(request, reply) {
    // listBucket only returns 1000 items. 
    // Need to update this function to retrieve all items > 1000.
    return this.s3.listBucketDirectories().then(function(directories) {
        reply({
            data: directories
        });
    }).catch(function(err) {
        reply({
            message: err.message
        }).code(400);
    });
};

exports.fileList = function(request, reply) {
    var downloadName = request.params.downloadName + '/';
    return this.s3.listFiles(downloadName).then(
        function(files) {
            for (var i = 0; i < files.length; ++i) {
                if (files[i].Key === downloadName) {
                    files.splice(i, 1);
                    break;
                }
            }
            reply({
                data: files
            });
        }).catch(function(err) {
        reply({
            message: err.message
        }).code(400);
    });
};

exports.createNewDownload = function(request, reply) {
    var self = this;

    var downloadName = request.payload.downloadName + '/';

    return this.s3.createDownload(downloadName, request.payload.descriptionText)
        .then(function() {

            // Return status OK to host
            reply.continue();

            // Wait for the object to be added
            return self.s3.waitFor('objectExists', downloadName);

        }).then(function() {

            // Notify other clients via socket.io
            self.io.emit('refreshDownloadList');

        }).catch(function(err) {
            return reply({
                message: err.message
            }).code(400);
        });
};

exports.getSignedPutDownloadUrl = function(request, reply) {
    var self = this;

    var downloadName = request.params.downloadName + '/';

    return this.s3.doesDownloadExist(downloadName).then(function(
        downloadExists) {
        if (downloadExists === true) {
            return self.s3.getSignedPutObjectUrl(downloadName +
                request.query.s3ObjectName,
                request.query.s3ObjectType);
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
    var fileName = request.params.downloadName + '/' + request.params.fileName;

    return this.s3.getSignedGetObjectUrl(fileName).then(function(
        url) {

        reply.redirect(url);

    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.deleteFile = function(request, reply) {
    var self = this;

    var fileName = request.params.downloadName + '/' + request.params.fileName;
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
        self.io.emit('refreshDownloadList.' + request.params.downloadName);

    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });
};

exports.deleteDownload = function(request, reply) {
    var self = this;

    var downloadName = request.params.downloadName + '/';

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
        self.io.emit('refreshDownloadList');

    }).catch(function(err) {
        return reply({
            message: err.message
        }).code(400);
    });

};