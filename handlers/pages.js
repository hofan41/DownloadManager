exports.home = function(request, reply) {
  reply.view('index', {
    jsFiles: ['/js/downloadList.js']
  });
};