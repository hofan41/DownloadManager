'use strict';

// Load modules 
require('dotenv').load();
var Hapi = require('hapi');
var Hoek = require('hoek');
var BucketActions = require('./handlers/bucketActions');

// Declare internals
var internals = {};

exports.server = internals.server = new Hapi.Server();

internals.server.connection({
    port: Number(process.env.PORT || 8080),
    tls: require('./config').tls
});

internals.server.bind({
    s3: BucketActions
});

internals.defaultContext = {
    title: process.env.SITE_TITLE
};

internals.server.views({
    engines: {
        jade: require('jade')
    },
    relativeTo: __dirname,
    path: './views',
    isCached: false,
    context: internals.defaultContext
});

internals.server.register({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                response: '*',
                log: '*',
                error: '*'
            }
        }]
    }
}, function(err) {
    if (err) {
        throw err;
    }

    internals.server.register([
        require('./plugins/fileNotifications'), {
            register: require('clapper'),
            options: require('./config').clapper
        }
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
            console.error(err.stack);
            process.exit(1);
        });
    };

    internals.startServer();    
});

