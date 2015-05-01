'use strict';

var initializeMarkdownEditModal = function(modalId, markdownEventName, ajaxOptions) {

    var editMarkdownModal = $(modalId);
    var editMarkdownForm = $('form', editMarkdownModal);
    var editMarkdownAlert = $('.alert', editMarkdownModal);
    var editMarkdownButton = $('button#editMarkdownSave', editMarkdownModal);
    var editMarkdownTextArea = $('textarea', editMarkdownForm);
    var markdownData = '';

    $(document).on(markdownEventName, function(e, data) {
        markdownData = data;
    });

    var resetEditMarkdownForm = function() {
        editMarkdownAlert.hide();
        editMarkdownForm.trigger('reset');
        editMarkdownTextArea.val(markdownData);
    };

    var submitEditMarkdownForm = function(e) {
        e.preventDefault();

        // Hide the alert if there is one.
        editMarkdownAlert.hide();

        editMarkdownButton.prop('disabled', true);

        ajaxOptions.data = {
            content: editMarkdownTextArea.val()
        };

        $.ajax(ajaxOptions)
            .done(function() {
                editMarkdownModal.modal('hide');
            })
            .fail(function(jqXHR) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                    editMarkdownAlert.text(jqXHR.responseJSON
                        .message);
                    editMarkdownAlert.fadeIn(500);
                }
            })
            .always(function() {
                editMarkdownButton.prop('disabled', false);
            });
    };

    editMarkdownModal.on('show.bs.modal', function() {
        resetEditMarkdownForm();
    });

    editMarkdownModal.on('shown.bs.modal', function() {
        editMarkdownTextArea.focus();
    });

    editMarkdownButton.click(submitEditMarkdownForm);

    editMarkdownForm.submit(submitEditMarkdownForm);
};