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
    path: '/repo/{githubUser}/{githubRepo}/{branch}/{commit}/',
    method: 'GET',
    handler: Pages.commit,
    config: {
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                githubUser: Joi.string().required(),
                githubRepo: Joi.string().required(),
                branch: Joi.string().required(),
                commit: Joi.string().length(40, 'utf8').required()
            }
        }
    }
}, {
    path: '/repo/{githubUser}/{githubRepo}/{branch}/',
    method: 'GET',
    handler: Pages.commits,
    config: {
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                githubUser: Joi.string().required(),
                githubRepo: Joi.string().required(),
                branch: Joi.string().required()
            }
        }
    }
}, {
    path: '/repo/{githubUser}/{githubRepo}/',
    method: 'GET',
    handler: Pages.branches,
    config: {
        plugins: {
            clapper: {
                download: true
            }
        },
        validate: {
            params: {
                githubUser: Joi.string().required(),
                githubRepo: Joi.string().required()
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
    path: '/api/list/{githubUser}/{githubRepo}',
    method: 'GET',
    handler: Api.branchList,
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
                githubUser: Joi.string().required(),
                githubRepo: Joi.string().required()
            }
        }
    }
}, {
    path: '/api/list/{githubUser}/{githubRepo}/{branch}',
    method: 'GET',
    handler: Api.commitList,
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
                githubUser: Joi.string().required(),
                githubRepo: Joi.string().required(),
                branch: Joi.string().required()
            },
            query: Joi.object({
                draw: Joi.number().integer(),
                start: Joi.number().integer(),
                length: Joi.number().integer()
            }).unknown()
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
    handler: Api.repositoryList,
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