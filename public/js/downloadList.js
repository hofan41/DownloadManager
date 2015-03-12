'use strict';

$(function() {
    var dateFormat = 'LLL';
    var downloadNameVar = '{downloadName}';
    var downloadNameVarRegex = new RegExp(downloadNameVar, 'g');
    var downloadLink = '<a href="/download/' + downloadNameVar + '">' +
        downloadNameVar + '</a>';
    var deleteIcon =
        '<button type="button" class="btn btn-default deleteDownloadButton">' +
        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
        '</button>';
    var deleteButton = '<a href="' + downloadNameVar +
        '" role="button" class="btn btn-danger deleteDownloadLink">Delete</a>';

    $.fn.dataTable.moment(dateFormat);
    var dataTable = $('#downloadList').DataTable({
        processing: true,
        serverSide: false,
        ajax: '/api/downloads',
        order: [1, 'asc'],
        columns: [{
            data: null,
            orderable: false,
            render: {
                display: function(data, type, full) {
                    var downloadName = full.Key;
                    return deleteIcon + '\n\r' +
                        deleteButton.replace(
                            downloadNameVarRegex,
                            downloadName);
                }
            }
        }, {
            data: 'Key',
            render: {
                display: function(data) {
                    var downloadName = data.substring(
                        0, data.length - 1);
                    return downloadLink.replace(
                        downloadNameVarRegex,
                        downloadName);
                }
            }
        }, {
            data: 'LastModified',
            render: function(data) {
                return moment(data).format(
                    dateFormat);
            }
        }]
    });

    dataTable.on('draw.dt', function() {
        $('a.deleteDownloadLink').hide();
    });

    var socket = io();
    socket.on('refreshDownloadList', function() {
        dataTable.ajax.reload(null, false);
    });

    // Anytime the user clicks on a trashcan button, the delete link next
    // to it will be shown.
    $(document).on('click', 'button.deleteDownloadButton', function() {
        var deleteLink = $(this).parent().find(
            'a.deleteDownloadLink');
        deleteLink.toggle('slide');
    });

    // Anytime the user clicks, if there is a delete button shown, hide it.
    $(document).on('click', function(e) {
        if (!$(e.target).closest('a.deleteDownloadLink').length) {
            var deleteLinks = $('a.deleteDownloadLink');

            deleteLinks.each(function() {
                // Do not toggle for animated buttons
                if ($(this).is(':visible') &&
                    !$(this).is(':animated')) {
                    $(this).toggle('slide');
                }
            });
        }
    });

    $(document).on('click', 'a.deleteDownloadLink', function(e) {
        e.preventDefault();

        $(this).addClass('disabled');

        // Perform ajax request to remove
        $.ajax({
                type: 'DELETE',
                url: '/api/download/' + this.href
            })
            .fail(function() {
                // TODO - Figure out what to do if it fails.
            });
    });
});