/*
 * jQuery Datatables
 * Displays the top level directories within the download manager's bucket.
 *
 */

'use strict';

$(function() {
    var downloadNameVar = '{downloadName}';
    var downloadNameVarRegex = new RegExp(downloadNameVar, 'g');
    var downloadLink = '<a href="/download/' + downloadNameVar + '/">' +
        downloadNameVar + '</a>';
    var deleteIcon =
        '<div style="display: inline-block;">' +
        '<button type="button" class="btn btn-default deleteDownloadButton">' +
        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
        '</button>';
    var deleteButton = '<a href="/download/' + downloadNameVar +
        'api" role="button" class="btn btn-danger deleteDownloadLink">' +
        'Delete</a></div>';

    var dataTable = $('#downloadList').DataTable({
        processing: true,
        serverSide: false,
        ajax: 'api/list',
        order: [1, 'asc'],
        columns: [{
            data: null,
            orderable: false,
            render: {
                display: function(data, type, full) {
                    var downloadName = full.Prefix;
                    return deleteIcon + '\n\r' +
                        deleteButton.replace(
                            downloadNameVarRegex,
                            downloadName);
                }
            }
        }, {
            data: 'Prefix',
            render: {
                display: function(data) {
                    var downloadName = data.substring(
                        0, data.length - 1);
                    return downloadLink.replace(
                        downloadNameVarRegex,
                        downloadName);
                }
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
        deleteLink.show('slide');
    });

    // Anytime the user clicks, if there is a delete button shown, hide it.
    $(document).on('click', function(e) {
        if (!$(e.target).closest('a.deleteDownloadLink').length) {
            var deleteLinks = $('a.deleteDownloadLink');

            deleteLinks.each(function() {
                // Do not toggle for animated buttons
                if ($(this).is(':visible') &&
                    !$(this).is(':animated')) {
                    $(this).hide('slide');
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
                url: this.href
            })
            .fail(function() {
                // TODO - Figure out what to do if it fails.
            });
    });
});