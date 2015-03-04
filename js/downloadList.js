$(document).ready(function() {
	$.fn.dataTable.moment('LLL');
	var dataTable = $('#downloadList').DataTable({
		processing: true,
		serverSide: false,
		ajax: '/api/downloads',
		columns: [{
			data: "Key",
		}, {
			data: "LastModified",
			render: function(data, type, full, meta) {
				return moment(data).format('LLL');
			}
		}]
	});

	var socket = io();
	socket.on('putObject', function(msg) {
		dataTable.ajax.reload();
	});
});