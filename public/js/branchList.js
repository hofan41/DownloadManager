/*
 * jQuery Datatables
 * Displays the top level directories within the download manager's bucket.
 *
 */

'use strict';

$(function() {
    var branchNameVar = '{branchName}';
    var branchNameVarRegex = new RegExp(branchNameVar, 'g');
    var branchLink = '<a href="' + branchNameVar + '/">' + branchNameVar + '</a>';

    var columns = [];

    columns.push({
        data: 'name',
        render: {
            display: function(data) {
                return branchLink.replace(branchNameVarRegex, data);
            },
            sort: function(data, type, full) {
                return data;
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