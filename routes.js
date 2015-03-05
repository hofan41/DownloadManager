var Assets = require('./handlers/assets');
var BucketActions = require('./handlers/bucketActions');
var Pages = require('./handlers/pages');

// Server Endpoints
module.exports = [{
  path: '/',
  method: 'GET',
  handler: Pages.home
}, {
  path: '/api/downloads/put',
  method: 'GET',
  handler: BucketActions.createFolder
}, {
  path: '/api/downloads',
  method: 'GET',
  handler: BucketActions.listBucket
}, {
  path: '/{param*}',
  method: 'GET',
  handler: Assets.servePublicDirectory
}];