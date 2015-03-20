'use strict';
var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var downloadManager = require('../');

lab.experiment('HTTP Tests', function() {
    lab.test('GET /', function(done) {
        downloadManager.server.inject({
            url: '/',
            method: 'GET'
        }, function(res) {
            Code.expect(res.statusCode).to.equal(200);
            done();
        });
    });

    lab.test('GET /download/no-no/', function(done) {
        downloadManager.server.inject({
            url: '/download/no-no/'
        }, function(res) {
            Code.expect(res.statusCode).to.equal(400);
            done();
        });
    });
});