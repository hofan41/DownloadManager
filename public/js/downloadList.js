$(function() {
    var dateFormat = 'LLL';
    var downloadNameVar = '{downloadName}';
    var downloadNameVarRegex = new RegExp(downloadNameVar, 'g');
    var downloadLink = '<a href="/download/' + downloadNameVar + '">' + downloadNameVar + '</a>';
    var deleteIcon = '<button type="button" class="btn btn-default deleteDownloadButton"><span class="glyphicon glyphicon-trash" aria-hidden="true"></span></button>';
    var deleteButton = '<a href="/api/download/' + downloadNameVar + '" role="button" class="btn btn-danger deleteDownloadLink">Delete</a>';

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
                display: function(data, type, full, meta) {
                    var downloadName = full['Key'];
                    return deleteIcon + '\n\r' + deleteButton.replace(downloadNameVarRegex, downloadName);
                }
            }
        }, {
            data: "Key",
            render: {
                display: function(data, type, full, meta) {
                    var downloadName = data.substring(0, data.length - 1);
                    return downloadLink.replace(downloadNameVarRegex, downloadName);
                }
            }
        }, {
            data: "LastModified",
            render: function(data, type, full, meta) {
                return moment(data).format(dateFormat);
            }
        }]
    });

    dataTable.on('draw.dt', function() {
        $('a.deleteDownloadLink').hide();
    });

    var socket = io();
    socket.on('refreshDownloadList', function(msg) {
        dataTable.ajax.reload();
    });

    dataTable.on('click', 'button.deleteDownloadButton', function(e) {
        var deleteLink = $(this).parent().find('a.deleteDownloadLink');
        deleteLink.toggle('slide');
    });

    dataTable.on('click', 'a.deleteDownloadLink', function(e) {
        e.preventDefault();
        $(this).addClass('disabled');
        var self = $(this);

        // Perform ajax request to remove
        $.ajax({
                type: 'DELETE',
                url: this.href
            })
            .done(function(data, textStatus, jqXHR) {
                // Do nothing, this row should automatically disapppear.
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                // Do nothing.
            });
    });
});