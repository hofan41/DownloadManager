var Api = require('../../handlers/api');

module.exports = function() {

    return Api._getWebhooks().data;
};