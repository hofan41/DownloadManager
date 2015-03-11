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

  return this.s3.createDownload(request.payload.downloadName + '/', request.payload.descriptionText).then(function() {
    // Return status OK to host
    reply.continue();
    // Notify other clients via socket.io
    that.io.emit('refreshDownloadList');
  }).catch(function(err) {
    reply({
      message: err.message
    }).code(400);
  });
};

exports.deleteDownload = function(request, reply) {
  var that = this;

  var downloadName = request.params.downloadName + '/';

  // Issue delete object request to s3
  return this.s3.deleteObject(downloadName).then(function() {
    // Wait until the object has been deleted
    this.s3.waitFor('objectNotExists', downloadName);
  }).then(function() {
    // Return status OK to host
    reply.continue();
    // Notify other clients via socket.io
    that.io.emit('refreshDownloadList');
  }).catch(function(err) {
    reply({
      message: err.message
    }).code(400);
  });
};