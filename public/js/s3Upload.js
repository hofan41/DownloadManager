(function() {

    'use strict';

    window.S3Upload = (function() {
        var S3Upload = function(options) {
            if (options == null) {
                options = {};
            }
            for (var option in options) {
                this[option] = options[option];
            }
            this.handleFileSelect(
                document.getElementById(this.fileDomSelector)
            );
        };

        S3Upload.prototype.s3SignPutUrl = '/signS3put';

        S3Upload.prototype.fileDomSelector = 'file_upload';

        S3Upload.prototype.onFinishS3Put = function() {
            return console.log('base.onFinishS3Put()');
        };

        S3Upload.prototype.onProgress = function(percent, status) {
            return console.log('base.onProgress()', percent,
                status);
        };

        S3Upload.prototype.onError = function(status) {
            return console.log('base.onError()', status);
        };

        S3Upload.prototype.onComplete = function(err) {
            return console.log('base.onComplete()', err);
        }

        S3Upload.prototype.handleFileSelect = function(fileElement) {
            var f, files, output, _i, _len, _results;
            this.onProgress(0, 'Upload started.');
            files = fileElement.files;
            output = [];
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                f = files[_i];
                _results.push(this.uploadFile(f));
            }
            return _results;
        };

        S3Upload.prototype.createCORSRequest = function(method, url) {
            var xhr;
            xhr = new XMLHttpRequest();
            if (xhr.withCredentials != null) {
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest !== 'undefined') {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                xhr = null;
            }
            return xhr;
        };

        S3Upload.prototype.executeOnSignedUrl = function(file,
            callback) {
            var self, xhr;
            self = this;
            xhr = new XMLHttpRequest();
            xhr.open('GET', this.s3SignPutUrl +
                '?s3ObjectType=' + file.type +
                '&s3ObjectName=' + file.name, true);
            xhr.overrideMimeType(
                'text/plain; charset=x-user-defined');
            xhr.onreadystatechange = function() {
                var result;
                if (this.readyState === 4 && this.status ===
                    200) {
                    try {
                        result = JSON.parse(this.responseText);
                    } catch (error) {
                        self.onError(
                            'Signing server returned some ugly/empty JSON: "' +
                            this.responseText + '"');
                        return false;
                    }
                    return callback(result.signedRequest);
                } else if (this.readyState === 4 && this.status !==
                    200) {
                    return self.onError(
                        'Could not contact request signing server. Status = ' +
                        this.status);
                }
            };
            return xhr.send();
        };

        S3Upload.prototype.uploadToS3 = function(file, url) {
            var self, xhr;
            self = this;
            xhr = this.createCORSRequest('PUT', url);
            if (!xhr) {
                this.onError('CORS not supported');
            } else {
                xhr.onload = function() {
                    if (xhr.status === 200) {
                        self.onProgress(100,
                            'Upload completed.');
                        return self.onFinishS3Put();
                    } else {
                        return self.onError(
                            'Upload error: ' + xhr.status
                        );
                    }
                };
                xhr.onerror = function() {
                    return self.onError('XHR error.');
                };
                xhr.upload.onprogress = function(e) {
                    var percentLoaded;
                    if (e.lengthComputable) {
                        percentLoaded = Math.round((e.loaded /
                            e.total) * 100);
                        return self.onProgress(
                            percentLoaded,
                            percentLoaded === 100 ?
                            'Finalizing.' :
                            'Uploading.');
                    }
                };
            }

            if (file.type) {
                xhr.setRequestHeader('Content-Type', file.type);
            }
            return xhr.send(file);
        };

        S3Upload.prototype.uploadFile = function(file) {
            var self = this;
            return this.executeOnSignedUrl(file, function(
                signedURL) {
                return self.uploadToS3(file, signedURL);
            });
        };

        return S3Upload;

    })();

}).call(this);