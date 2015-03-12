'use strict';

$(function() {
    $('ul.navbar-nav a[href="' + this.location.pathname + '"]').parent()
        .addClass('active');
});