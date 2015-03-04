$(document).ready(function() {
	$.fn.dataTable.moment('LLL');
	$('#downloadList').DataTable({
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
});