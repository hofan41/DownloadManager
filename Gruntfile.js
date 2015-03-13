'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                browser: true,
                jquery: true,
                node: true,
                camelcase: true,
                eqeqeq: true,
                latedef: true,
                maxlen: 80,
                newcap: true,
                quotmark: 'single',
                strict: true,
                undef: true,
                unused: true,
                eqnull: true,

                globals: {
                    io: true,
                    moment: false,
                    it: false,
                    describe: false
                }
            },
            files: ['index.js', 'routes.js', 'handlers/**/*.js',
                'test/**/*.js',
                'public/**/*.js'
            ]
        },
        mocha_istanbul: {
            coverage: {
                options: {
                    coverage: true,
                    reportFormats: ['lcovonly'],
                    reporter: 'spec'
                },
                src: 'test'
            }
        },
        coveralls: {
            options: {
                force: true
            },
            DownloadManager: {
                src: 'coverage/lcov.info'
            }
        }
    });

    // Load the plugin that provides the jshint task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // load Mocha
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    grunt.loadNpmTasks('grunt-coveralls');

    // Set default tasks
    grunt.registerTask('default', ['jshint', 'mocha_istanbul']);
};