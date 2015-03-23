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
            Code.expect(res.statusCode, 'Status Code').to
                .equal(200);
            done();
        });
    });

    lab.test('GET /download/test123/', function(done) {
        downloadManager.server.inject({
            url: '/download/test123/'
        }, function(res) {
            Code.expect(res.statusCode, 'Status Code').to
                .equal(400);
            done();
        });
    });

    lab.test('PUT /api/downloads', function(done) {
        downloadManager.server.inject({
            url: '/api/downloads',
            method: 'PUT',
            payload: {
                downloadName: 'test123',
                descriptionText: 'lab test!'
            }
        }, function(res) {
            Code.expect(res.statusCode, 'Status Code').to
                .equal(200);
            done();
        });
    });

    lab.test('PUT /api/downloads again', function(done) {
        downloadManager.server.inject({
            url: '/api/downloads',
            method: 'PUT',
            payload: {
                downloadName: 'test123',
                descriptionText: 'lab test!'
            }
        }, function(res) {
            Code.expect(res.statusCode, 'Status Code').to
                .equal(400);
            done();
        });
    });

    lab.test(
        'GET /download/test123/api/signedPut?s3ObjectName=testDownload',
        function(done) {
            downloadManager.server.inject({
                url: '/download/test123/api/signedPut' +
                    '?s3ObjectName=testDownload',
                method: 'GET'
            }, function(res) {
                Code.expect(res.statusCode, 'Status Code').to
                    .equal(200);
                Code.expect(res.result.signedRequest,
                    'Signed URL').to.be.a.string();
                done();
            });
        });

    lab.test('DELETE /download/test123/api', function(done) {
        downloadManager.server.inject({
            url: '/download/test123/api',
            method: 'DELETE'
        }, function(res) {
            Code.expect(res.statusCode, 'Status Code').to
                .equal(200);
            done();
        });
    });


});