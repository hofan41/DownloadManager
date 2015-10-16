/*
 * jQuery Datatables
 * Displays the top level directories within the download manager's bucket.
 *
 */

'use strict';

$(function() {
    var columns = [];

    var getCommitLink = function(commitSha, text) {
        return '<a href="' + commitSha + '/">' + text + '</a>';
    };

    var getDateString = function(date) {
        var mDate = moment(new Date(date));
        return mDate.fromNow();
    };

    columns.push({
        data: 'commit.message',
        orderable: false,
        className: 'clearfix',
        render: {
            display: function(data, type, full) {
                var message = '<span class="glyphicon glyphicon-user avatar pull-left" aria-hidden="true"></span>';

                if (full.author) {
                    message = '<a href="' + full.author.html_url + '">' +
                        '<img src="' + full.author.avatar_url + '" class="avatar img-rounded pull-left">' + '</a>';
                }

                message += getCommitLink(full.sha, data);
                message += '<div class="meta">by ' + full.commit.author.name + ' ' + getDateString(full.commit.author.date) + '</div>';
                return message;
            }
        }
    }, {
        data: 'sha',
        className: 'sha',
        orderable: false,
        render: {
            display: function(data) {
                return getCommitLink(data, data.substring(0, 7));
            }
        }
    });

    var dataTable = $('#downloadList').DataTable({
        processing: true,
        serverSide: true,
        lengthChange: false,
        ordering: false,
        ajax: internals.dataTableAjax,
        columns: columns,
        pageLength: 10,
        searching: false
    });
});