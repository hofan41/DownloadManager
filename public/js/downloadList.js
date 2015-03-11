$(function() {
	var dateFormat = 'LLL';
	var downloadNameVar = '{downloadName}';
	var downloadNameVarRegex = new RegExp(downloadNameVar, 'g');
	var downloadLink = '<a href="/download/' + downloadNameVar + '">' + downloadNameVar + '</a>';

	$.fn.dataTable.moment(dateFormat);
	var dataTable = $('#downloadList').DataTable({
		processing: true,
		serverSide: false,
		ajax: '/api/downloads',
		columns: [{
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

	var socket = io();
	socket.on('refreshDownloadList', function(msg) {
		dataTable.ajax.reload();
	});
});