'use strict';

var uploadNewDownloadFile = function(getPutUrl, fileDomSelector, progressDiv,
    callback) {
    var fileName = $('#' + fileDomSelector).val().split(/(\\|\/)/g).pop();

    if (!fileName) {
        return callback();
    }

    var progressSelector = $('#' + progressDiv);
    progressSelector.removeClass('collapse');
    var progressBarSelector = progressSelector.find('.progress-bar');

    // Clear all stylings on the progress bar.
    progressBarSelector.removeClass();

    // Set it to be active and begin upload.
    progressBarSelector.addClass('progress-bar progress-bar-striped active');
    progressBarSelector.width(0);

    var s3Upload = new S3Upload({
        fileDomSelector: fileDomSelector,
        s3SignPutUrl: getPutUrl,
        onProgress: function(percent, message) {
            progressBarSelector.width(percent + '%');
        },
        onFinishS3Put: function() {
            progressBarSelector.removeClass();
            progressBarSelector.addClass(
                'progress-bar progress-bar-success');
            callback();
        },
        onError: function(status) {
            progressBarSelector.removeClass();
            progressBarSelector.addClass(
                'progress-bar progress-bar-danger');
            callback({
                message: status
            });
        }
    });
};

$(function() {
    var uploadFileId = 'uploadFile';
    var uploadFileProgressId = 'uploadFileProgress';

    $('#uploadFileButton').on('click', function(e) {
        var self = $(this);
        e.preventDefault();
        self.addClass('disabled');
        var getPutUrl = $(this).parent('form').attr('action');
        uploadNewDownloadFile(getPutUrl, uploadFileId,
            uploadFileProgressId,
            function() {
                self.removeClass('disabled');
                $('#' + uploadFileId).val('');
                var socket = io();
                socket.emit('newFileUploaded', internals.downloadName);
            });
    });

    $('#' + uploadFileId).on('change', function() {
        $('#' + uploadFileProgressId).addClass('collapse');
    });

});