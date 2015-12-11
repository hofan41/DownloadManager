function ModalForm(modalId, saveButtonId, submitMethod, submitUrl) {
    this.submitMethod = submitMethod;
    this.submitUrl = submitUrl;
    this.modalId = $(modalId);
    this.modalForm = $('form', this.modalId);
    this.modalAlert = $('.alert', this.modalId);

    this.saveButtonId = $(saveButtonId, this.modalId);

    var that = this;

    this.reset = function() {
        that.modalAlert.hide();
        that.modalForm.trigger('reset');
    };

    this.submit = function(e) {
        e.preventDefault();

        // Hide the alert if there is one.
        that.modalAlert.hide();

        that.saveButtonId.prop('disabled', true);

        $.ajax({
                type: that.submitMethod,
                url: that.submitUrl,
                data: that.modalForm.serialize()
            })
            .done(function() {
                that.modalId.modal('hide');
            })
            .fail(function(jqXHR) {
                if (jqXHR.responseJSON) {

                    if (jqXHR.responseJSON.message) {
                        $('.alert-text', that.modalAlert).text(jqXHR.responseJSON.message);
                    } else if (jqXHR.responseJSON.error) {
                        $('.alert-text', that.modalAlert).text(jqXHR.responseJSON.statusCode + ' : ' + jqXHR.responseJSON.error);
                    }

                    that.modalAlert.fadeIn(500);
                }
            })
            .always(function() {
                that.saveButtonId.prop('disabled', false);
            });
    };

    this.modalId.on('show.bs.modal', function() {
        that.reset();
    });

    this.modalId.on('shown.bs.modal', function() {
        $(that).find('input:first').focus();
    });


    this.saveButtonId.click(this.submit);

    this.modalForm.submit(this.submit);
}
