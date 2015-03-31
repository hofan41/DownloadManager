var Joi = require('joi');
var Assets = require('./handlers/assets');
var Pages = require('./handlers/pages');
var Api = require('./handlers/api');

var internals = {};

internals.joiDownloadName = Joi.string().label('Download Name').min(3).max(64)
    .regex(/^[A-Z0-9 -]+$/i).required();
internals.joiDescriptionText = Joi.any().label('Description');

internals.joiFileName = Joi.string().label('File Name').required();

internals.s3ObjectName = Joi.string().required();
internals.s3ObjectType = Joi.string().allow('');

// Server Endpoints
module.exports = [{
    path: '/',
    method: 'GET',
    handler: Pages.home
}, {
    path: '/download/{downloadName}/',
    method: 'GET',
    handler: Pages.download,
    config: {
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/download/{downloadName}/api',
    method: 'DELETE',
    handler: Api.deleteDownload,
    config: {
        app: {
            isAPI: true
        },
        auth: {
            mode: 'required'
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/download/{downloadName}/api/list',
    method: 'GET',
    handler: Api.fileList,
    config: {
        app: {
            isAPI: true
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/download/{downloadName}/api/signedPut',
    method: 'GET',
    handler: Api.getSignedPutDownloadUrl,
    config: {
        app: {
            isAPI: true
        },
        auth: {
            mode: 'required'
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            },
            query: {
                s3ObjectName: internals.s3ObjectName,
                s3ObjectType: internals.s3ObjectType
            }
        }
    }
}, {
    path: '/download/{downloadName}/{fileName}/api',
    method: 'GET',
    handler: Api.downloadFile,
    config: {
        auth: {
            mode: 'required'
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName,
                fileName: internals.joiFileName
            }
        }
    }
}, {
    path: '/download/{downloadName}/{fileName}/api',
    method: 'DELETE',
    handler: Api.deleteFile,
    config: {
        app: {
            isAPI: true
        },
        auth: {
            mode: 'required'
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName,
                fileName: internals.joiFileName
            }
        }
    }
}, {
    path: '/api/downloads',
    method: 'PUT',
    handler: Api.createNewDownload,
    config: {
        app: {
            isAPI: true
        },
        auth: {
            mode: 'required'
        },
        validate: {
            payload: {
                downloadName: internals.joiDownloadName,
                descriptionText: internals.joiDescriptionText
            }
        }
    }
}, {
    path: '/api/list',
    method: 'GET',
    handler: Api.downloadsList,
    config: {
        app: {
            isAPI: true
        }
    }
}, {
    path: '/{param*}',
    method: 'GET',
    handler: Assets.servePublicDirectory
}];