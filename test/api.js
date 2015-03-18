'use strict';

var assert = require('assert');
var downloadManager = require('../index');
downloadManager.configureServer();

describe('GET /', function() {
    it('returns 200', function(done) {
        downloadManager.server.inject({
            url: '/'
        }, function(res) {
            assert.equal(res.statusCode, 200);
            done();
        });
    });
});

describe('GET /download/no-no', function() {
    it('non existent item returns 400', function(done) {
        downloadManager.server.inject({
            url: '/download/no-no'
        }, function(res) {
            assert.equal(res.statusCode, 400);
            done();
        });
    });
});