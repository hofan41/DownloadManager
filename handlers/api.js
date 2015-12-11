'use strict';

var Path = require('path');
var fs = require('fs');

exports.addWebhook = function(request, reply) {

    var webhooks = {
        webhooks: []
    };

    if (fs.existsSync('webhooks.json')) {
        console.log(fs.realpathSync('webhooks.json'));
        webhooks = require(fs.realpathSync('webhooks.json'));
    }

    webhooks.webhooks.push({
        name: request.payload.name,
        repository: request.payload.repository,
        url: request.payload.url,
        method: request.payload.method,
        payload: request.payload.payload
    });

    fs.writeFileSync('webhooks.json', JSON.stringify(webhooks));

    return reply();
};

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

exports.repositoryList = function(request, reply) {

    return this.github.repos.getAll({}).then(function(repositories) {

        return reply({
            data: repositories
        });
    }).catch(function(err) {

        return reply({
            message: err.message
        }).code(400);
    });
};

exports.branchList = function(request, reply) {

    return this.github.repos.getBranches({
        user: request.params.githubUser,
        repo: request.params.githubRepo
    }).then(function(branches) {

        return reply({
            data: branches
        });
    }).catch(function(err) {

        return reply({
            message: err.message
        }).code(400);
    });
};

exports.commitList = function(request, reply) {

    return this.github.repos.getCommits({
        user: request.params.githubUser,
        repo: request.params.githubRepo,
        sha: request.params.branch,
        per_page: request.query.length,
        page: (request.query.start + request.query.length) / request.query.length

    }).then(function(commits) {

        var recordsTotal = request.query.start + commits.length;

        if (commits.length == request.query.length) {
            recordsTotal = request.query.start + request.query.length + 1;
        }

        return reply({
            draw: request.query.draw,
            data: commits,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsTotal
        });
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
    var downloadName = request.params.downloadName + '/';
    return this.s3.listFiles(downloadName).then(function(files) {

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

    var downloadName = request.params.downloadName;

    return this.s3.doesDownloadExist(downloadName + request.query.s3ObjectName).then(function(downloadExists) {
        if (downloadExists === false) {
            return self.s3.getSignedPutObjectUrl(downloadName +
                request.query.s3ObjectName,
                request.query.s3ObjectType,
                request.auth.credentials.profile.displayName);
        } else {
            throw new Error('Download already exists!');
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

    return this.s3.getSignedGetObjectUrl(fileName).then(function(url) {

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
        return self.s3.waitFor('objectNotExists', fileName);

    }).then(function() {

        // Notify other clients via socket.io
        request.server.methods.refreshDownloadFileList(Path.parse(request.params.downloadName).dir + '/');

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
