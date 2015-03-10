exports.home = function(request, reply) {
  reply.view('index', {
    jsFiles: ['/js/downloadList.js']
  });
};

exports.download = function(request, reply) {
  this.s3.getObject(request.params.downloadName).then(function(s3Response) {
    reply.view('download', {
      downloadName: request.params.downloadName,
      download: s3Response.data
    });
  });
};