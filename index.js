'use strict';

// Load modules 
var Hapi = require('hapi');
var Hoek = require('hoek');
var BucketActions = require('./handlers/bucketActions');

// Declare internals
var internals = {};

exports.server = internals.server = new Hapi.Server();

internals.server.connection({
    port: Number(process.env.PORT || 8080)
});

internals.server.bind({
    s3: BucketActions
});

internals.defaultContext = {
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
    context: internals.defaultContext
});

internals.server.register([
    require('./plugins/fileNotifications'),
    require('./plugins/authentication')
], function(err) {
    Hoek.assert(!err, 'Failed loading plugin: ' + err);
});

internals.server.route(require('./routes'));

exports.startServer = internals.startServer = function() {
    BucketActions.validateSettings().then(function() {
        internals.server.start(function(err) {
            if (err) {
                console.error(err);
            }
        });
    }).catch(function(err) {
        console.error(err);
        process.exit(1);
    });
};

internals.startServer();