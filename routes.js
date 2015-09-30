var Joi = require('joi');
var Assets = require('./handlers/assets');
var Pages = require('./handlers/pages');
var Api = require('./handlers/api');

var internals = {};

internals.joiDownloadName = Joi.string().label('Download Name').min(3).required();

internals.s3ObjectName = Joi.string().not('README.md').required();
internals.s3ObjectType = Joi.string().allow('');

internals.markdownContent = Joi.string().allow('');

// Server Endpoints
module.exports = [{
    path: '/',
    method: 'GET',
    handler: Pages.home
}, {
    path: '/download/{downloadName*}',
    method: 'GET',
    handler: Pages.download,
    config: {
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/api/download/{downloadName*}',
    method: 'DELETE',
    handler: Api.deleteDownload,
    config: {
        app: {
            isAPI: true
        },
        plugins: {
            clapper: {
                delete: true
            }
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/api/download/{downloadName*}',
    method: 'GET',
    handler: Api.downloadFile,
    config: {
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/api/readme/{downloadName*}',
    method: 'PUT',
    handler: Api.updateReadme,
    config: {
        app: {
            isAPI: true
        },
        plugins: {
            clapper: {
                upload: true
            }
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            },
            payload: {
                content: internals.markdownContent.required()
            }
        }
    }
}, {
    path: '/api/list/{downloadName*}',
    method: 'GET',
    handler: Api.fileList,
    config: {
        app: {
            isAPI: true
        },
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                downloadName: internals.joiDownloadName
            }
        }
    }
}, {
    path: '/api/signedPut/{downloadName*}',
    method: 'GET',
    handler: Api.getSignedPutDownloadUrl,
    config: {
        app: {
            isAPI: true
        },
        plugins: {
            clapper: {
                upload: true
            }
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
    path: '/api/downloads',
    method: 'PUT',
    handler: Api.createNewDownload,
    config: {
        app: {
            isAPI: true
        },
        plugins: {
            clapper: {
                upload: true
            }
        },
        validate: {
            payload: {
                downloadName: internals.joiDownloadName
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
        },
        plugins: {
            clapper: {
                download: true
            }
        }
    }
}, {
    path: '/bower/{param*}',
    method: 'GET',
    handler: Assets.serveBowerComponents
}, {
    path: '/{param*}',
    method: 'GET',
    handler: Assets.servePublicDirectory
}];