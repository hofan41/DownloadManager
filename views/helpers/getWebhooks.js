var Api = require('../../handlers/api.js');

module.exports = function() {

    return Api.getWebhooks().webhooks;
};
