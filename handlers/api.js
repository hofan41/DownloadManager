exports.downloadsList = function(request, reply) {
  return this.s3.listBucket().then(function(s3Response) {
    reply({
      data: s3Response.data.Contents
    });
  }).catch(function(err) {
    reply({
      message: err.message
    }).code(400);
  });
};

exports.createNewDownload = function(request, reply) {
  var that = this;

  return this.s3.createFolder(request.payload.downloadName, request.payload.descriptionText).then(function() {
    // Return status OK to host
    reply.continue();
    // Notify other clients via socket.io
    that.io.emit('putObject');
  }).catch(function(err) {
    reply({
      message: err.message
    }).code(400);
  });
}