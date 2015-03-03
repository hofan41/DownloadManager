var Path = require('path');
var Hapi = require('hapi');
var aws = require('aws-sdk');

var server = new Hapi.Server();

console.log("Hello world!");
console.log(process.env.AWS_ACCESS_KEY_ID);

server.connection({
  port: 8080
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
  path: '/',
  method: 'GET',
  handler: function(request, reply) {
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    var s3 = new aws.S3();

    var s3_params = {
      Bucket: process.env.S3_BUCKET
    };

    s3.listObjects(s3_params, function(err, data) {
      var returnData = JSON.stringify(data);
      console.log(returnData);
      reply(returnData);

    });

    
  }
});

server.views({
  engines: {
    html: require('handlebars')
  },
  path: 'views',
  relativeTo: __dirname
});

server.start();