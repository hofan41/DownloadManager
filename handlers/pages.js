'use strict';

var internals = {};

internals.getBreadcrumbs = function(params) {

    var breadcrumbs = [];
    var link = '/';

    if (params.githubUser && params.githubRepo) {
        breadcrumbs.push({
            name: 'repositories',
            link: link
        });

        link += 'repo/' + params.githubUser + '/' + params.githubRepo + '/';

        breadcrumbs.push({
            name: params.githubRepo,
            link: link
        });
    } else {
        return breadcrumbs;
    }

    if (params.branch) {
        link += params.branch + '/';
        breadcrumbs.push({
            name: params.branch,
            link: link
        });
    } else {
        return breadcrumbs;
    }

    if (params.commit) {
        link += params.commit + '/';
        breadcrumbs.push({
            name: params.commit,
            link: link
        })
    }

    return breadcrumbs;
};

exports.home = function(request, reply) {
    return reply.view('index', {
        tableHeading: 'Repositories',
        dataTableAjax: '/api/list',
        columns: ['Name', 'Last Commit'],
        jsFiles: ['/js/downloadList.js']
    });
};

exports.webhooks = function(request, reply) {

    return reply.view('webhooks', {
        tableHeading: 'Webhooks',
        dataTableAjax: '/api/webhooks',
        columns: ['', 'Repository', 'Name', 'Method', 'Url', 'Payload'],
        jsFiles: ['/js/webhookList.js']
    });
};

exports.download = function(request, reply) {
    var downloadName = request.params.downloadName;
    return reply.view('download', {
        downloadName: request.params.downloadName,
        breadcrumbs: request.params.downloadName.split('/'),
        readme: 'https://' + process.env.AWS_S3_BUCKET + '.s3.amazonaws.com/' + downloadName + 'README.md',
        jsFiles: ['/js/s3Upload.js',
            '/js/uploadNewDownloadFile.js',
            '/js/initializeMarkdownEditModal.js',
            '/js/downloadFileList.js'
        ]
    });
};

exports.branches = function(request, reply) {
    return reply.view('index', {
        breadcrumbs: internals.getBreadcrumbs(request.params),
        tableHeading: 'Branches',
        dataTableAjax: '/api/list/' + request.params.githubUser + '/' + request.params.githubRepo,
        columns: ['Name'],
        jsFiles: ['/js/branchList.js']
    })
};

exports.commits = function(request, reply) {
    return reply.view('index', {
        breadcrumbs: internals.getBreadcrumbs(request.params),
        tableHeading: 'Commits',
        dataTableAjax: '/api/list/' + request.params.githubUser + '/' + request.params.githubRepo + '/' + request.params.branch,
        columns: ['Commit', 'Hash'],
        jsFiles: ['/js/commitList.js']
    })
};

exports.commit = function(request, reply) {
    var hash = request.params.commit;
    return reply.view('download', {
        downloadName: hash,
        breadcrumbs: internals.getBreadcrumbs(request.params),
        readme: 'https://' + process.env.AWS_S3_BUCKET + '.s3.amazonaws.com/' + hash + 'README.md',
        jsFiles: ['/js/s3Upload.js',
            '/js/uploadNewDownloadFile.js',
            '/js/initializeMarkdownEditModal.js',
            '/js/downloadFileList.js'
        ]
    });
};