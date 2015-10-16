/*
 * jQuery Datatables
 * Displays the top level directories within the download manager's bucket.
 *
 */

'use strict';

$(function() {
    var dateFormat = 'LLL';
    var downloadNameVar = '{downloadName}';
    var downloadNameVarRegex = new RegExp(downloadNameVar, 'g');
    var downloadLink = '<a href="/repo/' + downloadNameVar + '/">' + downloadNameVar + '</a>';

    $.fn.dataTable.moment(dateFormat);

    var columns = [];

    columns.push({
        data: 'full_name',
        render: {
            display: function(data) {
                return downloadLink.replace(downloadNameVarRegex, data);
            },
            sort: function(data, type, full) {
                return data;
            }
        }
    }, {
        data: 'pushed_at',
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

    var dataTable = $('#downloadList').DataTable({
        processing: true,
        serverSide: false,
        ajax: internals.dataTableAjax,
        order: [0, 'asc'],
        columns: columns
    });
});