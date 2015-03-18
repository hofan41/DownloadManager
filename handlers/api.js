'use strict';

exports.downloadsList = function(request, reply) {
    // listBucket only returns 1000 items. 
    // Need to update this function to retrieve all items > 1000.
    return this.s3.listBucket().then(function(s3Response) {
        reply({
            data: s3Response.data.Contents
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

exports.deleteDownload = function(request, reply) {
    var self = this;

    var downloadName = request.params.downloadName + '/';

    return this.s3.doesDownloadExist(downloadName).then(function(
        downloadExists) {
        if (downloadExists === true) {
            // Issue delete object request to s3
            return self.s3.deleteObject(downloadName);
        } else {
            throw new Error('Download does not exist!');
        }
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