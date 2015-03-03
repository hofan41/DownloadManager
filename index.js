var Path = require('path');
var Hapi = require('hapi');
var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient, format = require('util').format;

MongoClient.connect(process.env.DOWNLOAD_MANAGER_MONGODB_URI, function(err, db) {
  if(err) {
    throw err;
  } else {
    console.log('Download manager connected to mongodb successfully!');
  }
});

var server = new Hapi.Server();

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
  path: '/',
  method: 'GET',
  handler: {
    view: 'projectList'
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