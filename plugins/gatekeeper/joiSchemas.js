'use strict';

var Joi = require('joi');

exports.pluginDefaultConfig = {
    cookie: {
        isSecure: true
    }
};

exports.accessConfig = Joi.object().pattern(/.+/, Joi.boolean());

exports.accessRightsConfig = Joi.object({
    anonymous: exports.accessConfig.required(),
    authenticated: exports.accessConfig.required()
}).required();

exports.pluginConfig = Joi.object({
    accessRights: exports.accessRightsConfig,
    cookie: Joi.object({
        password: Joi.string().required(),
        isSecure: Joi.boolean()
    }).required(),
    logins: Joi.array().items(Joi.object({
        provider: Joi.string().required(),
        clientId: Joi.string(),
        clientSecret: Joi.string(),
        scope: Joi.array().items(Joi.string()),
        plugins: Joi.array().items(Joi.object().keys({
            register: Joi.any(),
            options: Joi.any()
        }), Joi.string())
    }).min(1).and('clientId', 'clientSecret')).required()
});