'use strict';

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
        socket.on(updateWebhookStatusEvent, function(data) {
            var btn = $('#' + that.id);
            btn.button(data.status);
            btn.addClass('disabled');
        });
    });

});