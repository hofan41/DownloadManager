$(function() {
  var addNewDownloadModal = $('#addNewDownload');
  var addNewDownloadForm = $('form', addNewDownloadModal);
  var addNewDownloadAlert = $('.alert', addNewDownloadModal);
  var addNewDownloadButton = $('button#addNewDownloadSave', addNewDownloadModal);

  var resetAddNewDownloadForm = function() {
    addNewDownloadAlert.hide();
    addNewDownloadForm.trigger('reset');
  };

  var submitAddNewDownloadForm = function(e) {
    e.preventDefault();

    // Hide the alert if there is one.
    addNewDownloadAlert.hide();

    addNewDownloadButton.prop('disabled', true);
    $.ajax({
        type: 'PUT',
        url: '/api/downloads/put',
        data: addNewDownloadForm.serialize()
      })
      .done(function(data, textStatus, jqXHR) {
        addNewDownloadModal.modal('hide');
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
          addNewDownloadAlert.text(jqXHR.responseJSON.message);
          addNewDownloadAlert.fadeIn(500);
        }
      })
      .always(function() {
        addNewDownloadButton.prop('disabled', false);
      });
  };

  addNewDownloadModal.on('show.bs.modal', function(e) {
    resetAddNewDownloadForm();
  });

  addNewDownloadButton.click(submitAddNewDownloadForm);

  addNewDownloadForm.submit(submitAddNewDownloadForm);
});