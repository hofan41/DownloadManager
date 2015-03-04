var Path = require('path');
var Hapi = require('hapi');
var AWS = require('aws-sdk');

var server = new Hapi.Server();
var s3 = new AWS.S3();
var s3Params = {
  Bucket: process.env.AWS_S3_BUCKET
};

var defaultContext = {
  title: process.env.SITE_TITLE
};

server.connection({
  port: Number(process.env.PORT || 8080)
});

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
  path: '/api/downloads',
  method: 'GET',
  handler: function(request, reply) {
    s3.listObjects(s3Params, function(err, data) {
      reply({
        data: data.Contents,
        error: err
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