var Joi = require('joi');
var Assets = require('./handlers/assets');
var Pages = require('./handlers/pages');
var Api = require('./handlers/api');

// Server Endpoints
module.exports = [{
  path: '/',
  method: 'GET',
  handler: Pages.home
}, {
  path: '/download/{downloadName}',
  method: 'GET',
  handler: Pages.download
}, {
  path: '/api/downloads/put',
  method: 'PUT',
  handler: Api.createNewDownload,
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
  handler: Api.downloadsList
}, {
  path: '/{param*}',
  method: 'GET',
  handler: Assets.servePublicDirectory
}];