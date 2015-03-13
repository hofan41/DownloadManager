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