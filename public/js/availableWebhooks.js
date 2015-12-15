'use strict';

window.updateWebhookStatus = function(data) {
    var btn = $('#' + data.id);
    var btn_icons = $('#' + data.id + ' span');
    btn.removeClass('btn-danger btn-success btn-default');
    btn_icons.remove();
    btn.text(data.label);

    switch (data.status) {
        case 'success':
            btn.append('<span title="completed successfully!" class="glyphicon glyphicon-ok" style="margin-left: 10px;"></span>');
            btn.addClass('btn-success');
            btn.addClass('disabled');
            break;
        case 'fail':
            btn.append('<span title="failed to complete successfully!" class="glyphicon glyphicon-warning-sign" style="margin-left: 10px;"></span>');
            btn.addClass('btn-danger');
            btn.removeClass('disabled');
            break;
        case 'queued':
            btn.append('<span title="queued for running!" style="margin-left: 10px;"><i class="fa fa-circle-o-notch fa-spin" style="font-size:18px"></i></span>');
            btn.addClass('btn-default');
            btn.addClass('disabled');
            break;
        case 'running':
            btn.append('<span title="running!" style="margin-left: 10px;"><i class="fa fa-gear fa-spin" style="font-size:18px"></i></span>');
            btn.addClass('btn-default');
            btn.addClass('disabled');
            break;
    }
};

$(function() {
    $('.webhook-action').on('click', function(e) {
        e.preventDefault();
        $(this).addClass('disabled');
        var that = this;
        $.ajax({
            type: 'POST',
            url: this.href
        });
    });

    var socket = io();

    $('.webhook-action').each(function() {
        var updateWebhookStatusEvent = 'updateWebhookStatus.' + this.id;
        var that = this;
        socket.on(updateWebhookStatusEvent, updateWebhookStatus);
    });

});