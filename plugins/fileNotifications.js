var internals = {};

exports.register = function(server, options, next) {
    var io = require('socket.io')(server.listener);
    io.on('connection', function(socket) {
        socket.on('newFileUploaded', function(downloadName) {
            var broadcastEvent = 'refreshDownloadList.' +
                downloadName;
            io.sockets.emit(broadcastEvent);
        });
    });

    server.bind({
        io: io
    });

    next();
};

exports.register.attributes = {
    name: 'fileNotifications',
    version: '0.0.1'
};