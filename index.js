// Load modules 
var Path = require('path');
var Hapi = require('hapi');
var AWS = require('aws-sdk');

var server = new Hapi.Server();
server.connection({
  port: Number(process.env.PORT || 8080)
});

var io = require('socket.io')(server.listener);
var s3 = new AWS.S3();

// Declare internals
var internals = {};

internals.putObjectCallback = function(err, data, reply, s3Params) {
  if (err) {
    console.log('Error during putObjectCallback.');
    console.log(JSON.stringify(err));
    reply({
      error: err.message
    });
  } else {
    reply.continue();
    s3.waitFor('objectExists', s3Params, function(err, data) {
      if (data) {
        io.emit('putObject');
      }
    });
  }
};

internals.validateSettings = function(callback) {
  var s3Params = {
    Bucket: process.env.AWS_S3_BUCKET
  };

  s3.headBucket(s3Params, function(err, data) {
    if (err) {
      console.log('Download manager could not access aws bucket: ' + s3Params.Bucket);
      console.log(JSON.stringify(err));
    } else {
      console.log('Download manager successfully connected to aws bucket: ' + s3Params.Bucket);
    }
    return callback(err, data);
  });
};

internals.startServer = function() {
  var defaultContext = {
    title: process.env.SITE_TITLE
  };

  server.route({
    path: '/images/{image}',
    method: 'GET',
    handler: {
      directory: {
        path: Path.join(__dirname, 'images')
      }
    }
  });

  server.route({
    path: '/js/{javascript}',
    method: 'GET',
    handler: {
      directory: {
        path: Path.join(__dirname, 'js')
      }
    }
  });

  server.route({
    path: '/',
    method: 'GET',
    handler: {
      view: {
        template: 'index'
      }
    }
  });

  server.route({
    path: '/api/downloads/put',
    method: 'GET',
    handler: function(request, reply) {
      var s3Params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: request.query.projectName + '/'
      };

      console.log(JSON.stringify(s3Params));

      // Test if the object already exists
      s3.headObject(s3Params, function(err, data) {
        // We are looking for an error.
        if (err) {
          // If the error is that the object does not exist
          if (err.code === 'NotFound') {
            // Add the object
            s3.putObject(s3Params, function(err, data) {
              internals.putObjectCallback(err, data, reply, s3Params);
            });
          } else {
            // If it's some other type of error during getObject.
            reply(JSON.stringify(err));
          }
        } else {
          // If there was no error in getObject, then the object already exists.
          reply({
            error: 'Download name already exists in the system!'
          });
        }
      });
    }
  });

  server.route({
    path: '/api/downloads',
    method: 'GET',
    handler: function(request, reply) {
      var s3Params = {
        Bucket: process.env.AWS_S3_BUCKET
      };

      s3.listObjects(s3Params, function(err, data) {
        reply({
          data: err ? null : data.Contents,
          error: err ? err.message : null
        });
      });
    }
  });

  server.views({
    engines: {
      html: require('handlebars')
    },
    path: 'views',
    relativeTo: __dirname,
    helpersPath: 'helpers',
    context: defaultContext
  });


  server.start();
};

internals.validateSettings(function(err, data) {
  if (err) {
    throw new Error();
  } else {
    internals.startServer();
  }
});