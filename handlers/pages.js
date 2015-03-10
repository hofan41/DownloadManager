exports.home = function(request, reply) {
  reply.view('index', {
    jsFiles: ['/js/downloadList.js']
  });
};

exports.download = function(request, reply) {
  var viewContext = {
    downloadName: request.params.downloadName
  };

  this.s3.headObject(request.params.downloadName + '/').then(function(s3Response) {
    viewContext.download = s3Response.data;
    reply.view('download', viewContext);
  }).catch(function(err) {
    return reply({
      message: err.message
    });
  });
};