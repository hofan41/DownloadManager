/*
 * jQuery Datatables
 * Displays the top level directories within the download manager's bucket.
 *
 */

'use strict';

$(function() {
    var webhookId = '{id}';
    var webhookApiLink = '/api/webhook/' + webhookId;
    var webhookVarRegex = new RegExp(webhookId, 'g');
    var deleteIcon =
        '<div style="display: inline-block;">' +
        '<button type="button" class="btn btn-default deleteDownloadButton">' +
        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
        '</button>';
    var deleteButton = '<a href="' + webhookApiLink +
        '" role="button" class="btn btn-danger deleteDownloadLink">' +
        'Delete</a></div>';

    var columns = [];

    columns.push({
        data: null,
        orderable: false,
        width: '130px',
        render: {
            display: function(data, type, full) {
                var id = full.id;
                return deleteIcon + '\n\r' +
                    deleteButton.replace(
                        webhookVarRegex,
                        id);
            }
        }
    });

    columns.push({
        data: 'repository'
    }, {
        data: 'name'
    }, {
        data: 'method'
    }, {
        data: 'url'
    }, {
        data: 'payload'
    });

    var dataTable = $('#downloadList').DataTable({
        paging: false,
        processing: true,
        serverSide: false,
        ajax: internals.dataTableAjax,
        order: [1, 'asc'],
        columns: columns
    });

    var socket = io();
    var refreshEvent = 'refreshWebhookList';
    socket.on(refreshEvent, function() {
        dataTable.ajax.reload(null, false);
    });

    dataTable.on('draw.dt', function() {
        $('a.deleteDownloadLink').hide();
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