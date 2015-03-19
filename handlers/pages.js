'use strict';

exports.home = function(request, reply) {
    reply.view('index', {
        jsFiles: ['/js/downloadList.js']
    });
};

exports.download = function(request, reply) {
    var downloadName = request.params.downloadName + '/';
    this.s3.headObject(downloadName).then(function(
        s3Response) {
        reply.view('download', {
            downloadName: request.params.downloadName,
            download: s3Response.data,
            jsFiles: ['/js/s3Upload.js',
                '/js/uploadNewDownloadFile.js',
                '/js/downloadFileList.js'
            ]
        });
    }).catch(function(err) {
        console.log(err);
        reply({
            message: err.message
        }).code(400);
    });
};