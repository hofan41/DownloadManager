/*
 * Displays the files available inside a specific top level directory.
 *
 */

'use strict';

$(function() {
    // Initialize Markdown Edit Modal
    var readmeEditOptions = {
        type: 'PUT',
        url: '/api/readme/' + internals.downloadName
    };

    /* global initializeMarkdownEditModal: true */
    initializeMarkdownEditModal('#editReadme', 'editReadmeUpdated', readmeEditOptions);

    $('#editReadmeTextArea').markdown({
        onPreview: function(e) {
            e.$textarea.parent().addClass('markdown-body');
        }
    });

    // Initialize README.md
    var loadReadmeFile = function(data) {
        document.getElementById('readme').innerHTML = marked(data);
        $(document).trigger('editReadmeUpdated', data);
    };

    $.ajax({
        type: 'GET',
        cache: false,
        url: internals.readmeUrl
    }).done(function(readmeData) {
        loadReadmeFile(readmeData);
    }).fail(function(jqXHR, textStatus, errorThrown) {
        loadReadmeFile('Failed to retrieve README.md\n\n```\n' + textStatus + '\n' + JSON.stringify(errorThrown) + '\n```');
    });

    // Initialize Datatables
    var dateFormat = 'LLL';
    var fileNameVar = '{fileName}';
    var fileNameApiLink = '/api/download/' + fileNameVar;
    var fileNameVarRegex = new RegExp(fileNameVar, 'g');
    var deleteIcon =
        '<div style="display: inline-block;">' +
        '<button type="button" class="btn btn-default deleteDownloadButton">' +
        '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>' +
        '</button>';
    var deleteButton = '<a href="' + fileNameApiLink +
        '" role="button" class="btn btn-danger deleteDownloadLink">' +
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
            sort: function(data, type, full) {
                if (full.IsDirectory) {
                    return 'A' + data.replace(internals.downloadName, '');
                } else {
                    return 'Z' + data;
                }
            },
            display: function(data, type, full) {
                var arr = data.split(/(\\|\/)/g);
                var fileName = arr.pop();

                if (full.IsDirectory) {
                    arr.pop();
                    fileName = arr.pop() + '/';

                    return '<a href="/download/' + data + '">' + fileName + '</a>';
                } else if (internals.accessRights.download) {
                    return '<a href="/api/download/' + data + '">' +
                        fileName + '</a>';
                } else {
                    return fileName;
                }
            }
        }
    }, {
        data: 'Size',
        width: '90px',
        render: {
            display: function(data, type, full) {
                data = full.Size;
                if (data) {
                    var numData = Number(data);
                    if (numData > (1024 * 1024)) {
                        // Display in megabytes
                        return Number(numData / (1024 * 1024)).toFixed(2) + ' MB';
                    } else {
                        return Number(numData / 1024).toFixed(2) + ' KB';
                    }
                } else {
                    return '-';
                }
            }
        }
    }, {
        data: 'LastModified',
        width: '270px',
        render: {
            display: function(data) {
                if (data) {
                    return moment(new Date(data)).format(dateFormat);
                } else {
                    return '-';
                }
            }
        }
    });

    var lastModifiedIndex = columns.length - 1;

    var dataTable = $('#downloadFileList').DataTable({
        paging: false,
        processing: true,
        serverSide: false,
        ajax: '/api/list/' + internals.downloadName,
        order: [lastModifiedIndex, 'desc'],
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
    var readmeRefreshEvent = 'refreshReadmeFile.' + internals.downloadName;
    socket.on(readmeRefreshEvent, function(data) {
        loadReadmeFile(data.readmeData);
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