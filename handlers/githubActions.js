'use strict';

var Promise = require('bluebird');
var Hoek = require('hoek');
var GithubApi = require('github');

var internals = {};

internals.github = new GithubApi({
    version: '3.0.0'
});

internals.github.authenticate({
    type: 'token',
    token: require('../config').githubToken
});

module.exports = {
    repos: {
        getCommits: Promise.promisify(internals.github.repos.getCommits),
        getBranches: Promise.promisify(internals.github.repos.getBranches),
        getAll: Promise.promisify(internals.github.repos.getAll)
    }
};