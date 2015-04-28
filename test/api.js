'use strict';
var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var downloadManager = require('../');

var expect = Code.expect;

lab.experiment('unauthenticated login tests', function() {
    lab.test('homepage works', function(done) {
        downloadManager.server.inject({
            url: '/',
            method: 'GET'
        }, function(res) {
            expect(res.statusCode, 'Status Code').to
                .equal(200);
            done();
        });
    });

    lab.test('not found page works', function(done) {
        downloadManager.server.inject({
            url: '/download/test123/',
            method: 'GET'
        }, function(res) {
            expect(res.statusCode, 'Status Code').to
                .equal(400);
            done();
        });
    });

    lab.test('create new download unauthorized', function(done) {
        downloadManager.server.inject({
            url: '/api/downloads',
            method: 'PUT',
            payload: {
                downloadName: 'test123'
            }
        }, function(res) {
            expect(res.statusCode, 'Status Code').to
                .equal(401);
            done();
        });
    });

    lab.test(
        'anonymous download file unauthorized',
        function(done) {
            downloadManager.server.inject({
                url: '/download/test123/api/signedPut' +
                    '?s3ObjectName=testDownload',
                method: 'GET'
            }, function(res) {
                expect(res.statusCode, 'Status Code').to
                    .equal(401);
                done();
            });
        });

    lab.test('anonymous delete download unauthorized', function(done) {
        downloadManager.server.inject({
            url: '/download/test123/api',
            method: 'DELETE'
        }, function(res) {
            expect(res.statusCode, 'Status Code').to
                .equal(401);
            done();
        });
    });
});