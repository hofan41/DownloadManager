'use strict';

exports.home = function(request, reply) {
    return reply.view('index', {
        jsFiles: ['/js/downloadList.js']
    });
};

exports.download = function(request, reply) {
    var downloadName = request.params.downloadName;
    return reply.view('download', {
        downloadName: request.params.downloadName,
        readme: 'https://' + process.env.AWS_S3_BUCKET + '.s3.amazonaws.com/' + downloadName + 'README.md',
        jsFiles: ['/js/s3Upload.js',
            '/js/uploadNewDownloadFile.js',
            '/js/initializeMarkdownEditModal.js',
            '/js/downloadFileList.js'
        ]
    });
};