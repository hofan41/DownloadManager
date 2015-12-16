'use strict';

var Path = require('path');
var fs = require('fs');
var UUID = require('node-uuid');
var Wreck = require('wreck');

var internals = {};

internals.webhookFile = 'webhooks.json';

exports._getWebhooks = internals._getWebhooks = function() {
    var webhooks;

    try {
        if (fs.existsSync(internals.webhookFile)) {
            webhooks = JSON.parse(fs.readFileSync(fs.realpathSync(internals.webhookFile), 'utf8'));
        }
    } catch (err) {
        webhooks = {
            data: []
        };
    }


    return webhooks;
};

internals.persistWebhooks = function(webhooks) {

    fs.writeFileSync(internals.webhookFile, JSON.stringify(webhooks));
};

internals.addWebhook = function(webhook) {

    var webhooks = internals._getWebhooks();

    webhooks.data.push({
        id: UUID.v4(),
        name: webhook.name,
        repository: webhook.repository,
        url: webhook.url,
        method: webhook.method,
        payload: webhook.payload
    });

    internals.persistWebhooks(webhooks);
};

internals.deleteWebhook = function(webhookId) {

    var webhooks = internals._getWebhooks();

    var foundIndex = -1;
    for (var i = 0; i < webhooks.data.length; i++) {
        if (webhooks.data[i].id == webhookId) {
            foundIndex = i;
        }
    }

    if (foundIndex > -1) {
        webhooks.data.splice(foundIndex, 1);
    }

    internals.persistWebhooks(webhooks);
};

exports.getWebhooks = function(request, reply) {

    return reply(internals._getWebhooks());
};

exports.addWebhook = function(request, reply) {

    internals.addWebhook(request.payload);

    request.server.methods.refreshWebhookList();
    return reply.continue();
};

internals.injectWebhookVars = function(str, params) {

    var result = str;

    if (result) {
        result = result.replace(/\$V_COMMIT/g, params.commit);
        result = result.replace(/\$V_BRANCH/g, params.branch);
        result = result.replace(/\$V_USER/g, params.githubUser);
        result = result.replace(/\$V_REPO/g, params.githubRepo);
        result = result.replace(/\$V_WEBHOOK/g, params.webhookId);
    }

    return result;
};

exports.refreshDownloadsWebhook = function(request, reply) {

    reply.continue();

    request.server.methods.refreshDownloadFileList(request.query.commit);
};

exports.jenkinsUpdateWebhook = function(request, reply) {

    var webhooks = internals._getWebhooks();
    for (var i = 0; i < webhooks.data.length; i++) {
        if (webhooks.data[i].id == request.query.webhook) {
            var webhook = webhooks.data[i];

            webhook.commitsRunning = webhook.commitsRunning || {};
            webhook.commitsRunning[request.query.commit] = {};
            webhook.commitsRunning[request.query.commit].status = request.query.status;

            if (request.query.url) {
                webhook.commitsRunning[request.query.commit].jenkinsUrl = request.query.url;
            }

            internals.persistWebhooks(webhooks);

            request.server.methods.updateWebhookStatus({
                status: request.query.status,
                id: request.query.webhook,
                commit: request.query.commit,
                label: webhook.name
            });

            if (request.query.status == 'success') {
                // Tell clients to refresh download list
                request.server.methods.refreshDownloadFileList(request.query.commit);
            }


            return reply.continue();
        }
    }

    return reply().code(400);
};

exports.runWebhook = function(request, reply) {

    // retrieve the webhook information
    var foundWebhook = false;
    var webhooks = internals._getWebhooks();
    for (var i = 0; i < webhooks.data.length; i++) {
        if (webhooks.data[i].id == request.params.webhookId) {
            foundWebhook = true;
            var webhook = webhooks.data[i];

            // check if this webhook is already running
            if (webhook.commitsRunning &&
                webhook.commitsRunning[request.params.commit] &&
                webhook.commitsRunning[request.params.commit].status != 'fail') {
                return reply.continue();
            }

            var url = internals.injectWebhookVars(webhook.url, request.params);
            var payload = internals.injectWebhookVars(webhook.payload, request.params);

            request.server.log('response', 'Issuing Webhook Request: ' + url);

            Wreck.request(webhook.method, url, {
                payload: payload
            }, function(err, response) {

                if (err) {
                    return reply().code(400);
                }

                webhook.commitsRunning = webhook.commitsRunning || {};
                webhook.commitsRunning[request.params.commit] = {};
                webhook.commitsRunning[request.params.commit].status = 'queued';

                internals.persistWebhooks(webhooks);

                request.server.methods.updateWebhookStatus({
                    status: 'queued',
                    id: webhook.id,
                    commit: request.params.commit,
                    label: webhook.name
                });

                return reply.continue();
            });
        }
    }

    if (!foundWebhook) {
        return reply().code(400);
    }
};

exports.deleteWebhook = function(request, reply) {

    internals.deleteWebhook(request.params.id);

    request.server.methods.refreshWebhookList();
    return reply.continue();
};

exports.updateReadme = function(request, reply) {
    var self = this;
    var objectName = request.params.downloadName + '/README.md';

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