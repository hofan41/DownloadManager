// Load modules 
var Hapi = require('hapi');
var BucketActions = require('./handlers/bucketActions');

var server = new Hapi.Server();
server.connection({
  port: Number(process.env.PORT || 8080)
});

var io = require('socket.io')(server.listener);

server.bind({
  io: io,
  s3: BucketActions
});

// Declare internals
var internals = {};

internals.startServer = function() {
  var defaultContext = {
    title: process.env.SITE_TITLE
  };

  server.views({
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

  server.route(require('./routes'));

  server.start(function() {
    console.log('Server listening at:', server.info.uri);
  });
};

BucketActions.validateSettings().then(function() {
  internals.startServer();
}).catch(function(err) {
  process.exit(1);
});