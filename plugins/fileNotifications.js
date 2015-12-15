'use strict';

var internals = {};

internals.refreshReadmeFile = function(downloadName, data) {
    this.emit('refreshReadmeFile.' + downloadName, {
        readmeData: data
    });
};

internals.refreshDownloadList = function() {
    this.emit('refreshDownloadList');
};

internals.refreshDownloadFileList = function(downloadName) {
    this.emit('refreshDownloadList.' + downloadName);
};

internals.refreshWebhookList = function() {
    this.emit('refreshWebhookList');
};

internals.updateWebhookStatus = function(data) {
    this.emit('updateWebhookStatus.' + data.id, data);
};

exports.register = function(server, options, next) {
    internals.io = require('socket.io')(server.listener);

    server.method([{
        name: 'refreshDownloadList',
        method: internals.refreshDownloadList,
        options: {
            bind: internals.io
        }
    }, {
        name: 'refreshDownloadFileList',
        method: internals.refreshDownloadFileList,
        options: {
            bind: internals.io
        }
    }, {
        name: 'refreshReadmeFile',
        method: internals.refreshReadmeFile,
        options: {
            bind: internals.io
        }
    }, {
        name: 'refreshWebhookList',
        method: internals.refreshWebhookList,
        options: {
            bind: internals.io
        }
    }, {
        name: 'updateWebhookStatus',
        method: internals.updateWebhookStatus,
        options: {
            bind: internals.io
        }
    }]);

    internals.io.on('connection', function(socket) {
        socket.on('newFileUploaded', function(downloadName) {
            server.methods.refreshDownloadFileList(downloadName);
        });
    });

    next();
};

exports.register.attributes = {
    name: 'fileNotifications',
    version: '0.0.1'
};