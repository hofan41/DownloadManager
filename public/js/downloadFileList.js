/*
 * jQuery Datatables
 * Displays the files available inside a specific top level directory.
 *
 */

'use strict';

$(function() {
    var dateFormat = 'LLL';
    var fileNameVar = '{fileName}';
    var fileNameVarRegex = new RegExp(fileNameVar, 'g');
    var deleteIcon =
        '<div style="display: inline-block;">' +
        '<button type="button" class="btn btn-default deleteDownloadButton">' +
        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
        '</button>';
    var deleteButton = '<a href="/download/' + fileNameVar +
        '/api" role="button" class="btn btn-danger deleteDownloadLink">' +
        'Delete</a></div>';

    $.fn.dataTable.moment(dateFormat);

    var columns = [];

    if (internals.accessRights.delete) {
        columns.push({
            data: null,
            orderable: false,
            width: '130px',
            render: {
                display: function(data, type, full) {
                    var fileName = full.Key;
                    return deleteIcon + '\n\r' +
                        deleteButton.replace(
                            fileNameVarRegex,
                            fileName);
                }
            }
        });
    }

    columns.push({
        data: 'Key',
        render: {
            display: function(data) {
                var fileName = data.split(/(\\|\/)/g).pop();

                if (internals.accessRights.download) {
                    return '<a href="/download/' + data + '/api">' +
                        fileName + '</a>';
                }

                return fileName;
            }
        }
    }, {
        data: 'LastModified',
        width: '270px',
        render: function(data) {
            return moment(new Date(data)).format(
                dateFormat);
        }
    }, {
        data: 'Metadata.author',
        width: '135px'
    });

    var dataTable = $('#downloadFileList').DataTable({
        processing: true,
        serverSide: false,
        ajax: 'api/list',
        order: [columns.length - 1, 'desc'],
        columns: columns
    });

    dataTable.on('draw.dt', function() {
        $('a.deleteDownloadLink').hide();
    });

    var socket = io();
    var refreshEvent = 'refreshDownloadList.' + internals.downloadName;
    socket.on(refreshEvent, function() {
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