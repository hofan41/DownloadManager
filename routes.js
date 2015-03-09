var Joi = require('joi');
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
  method: 'PUT',
  handler: BucketActions.createFolder,
  config: {
    validate: {
      payload: {
        downloadName: Joi.string().label('Download Name').min(3).max(64).regex(/^[A-Z0-9 -]+$/i).required(),
        descriptionText: Joi.any().label('Description')
      }
    }
  }
}, {
  path: '/api/downloads',
  method: 'GET',
  handler: BucketActions.listBucket
}, {
  path: '/{param*}',
  method: 'GET',
  handler: Assets.servePublicDirectory
}];