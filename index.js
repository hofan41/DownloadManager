'use strict';

// Load modules 
var Hapi = require('hapi');
var BucketActions = require('./handlers/bucketActions');

// Declare internals
var internals = {};

exports.server = internals.server = new Hapi.Server();

internals.server.connection({
    port: Number(process.env.PORT || 8080)
});

var io = require('socket.io')(internals.server.listener);
io.on('connection', function(socket) {
    socket.on('newFileUploaded', function(downloadName) {
        var broadcastEvent = 'refreshDownloadList.' +
            downloadName;
        io.sockets.emit(broadcastEvent);
    });
});

internals.server.bind({
    io: io,
    s3: BucketActions
});

exports.configureServer = internals.configureServer = function() {
    var defaultContext = {
        title: process.env.SITE_TITLE
    };

    internals.server.views({
        engines: {
            hbs: require('handlebars')
        },
        relativeTo: __dirname,
        path: './views',
        layoutPath: './views/layout',
        layout: true,
        isCached: false,
        context: defaultContext
    });

    internals.server.route(require('./routes'));
};

exports.startServer = internals.startServer = function() {
    BucketActions.validateSettings().then(function() {
        internals.configureServer();

        internals.server.start(function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Server listening at:',
                    internals.server.info.uri);
            }
        });
    }).catch(function(err) {
        console.error(err);
        process.exit(1);
    });
};

internals.startServer();