'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            dev: {
                src: '.env'
            }
        },
        jshint: {
            options: {
                browser: true,
                jquery: true,
                node: true,
                camelcase: true,
                eqeqeq: true,
                latedef: true,
                maxlen: 140,
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
                    describe: false,
                    internals: true,
                    S3Upload: false
                }
            },
            files: ['index.js', 'routes.js', 'handlers/**/*.js', 'test/**/*.js', 'public/**/*.js', 'plugins/**/*.js']
        },
        lab: {
            color: true,
            coverage: true,
            verbose: true,
//            reporter: 'lcov',
//            reportFile: 'coverage/lcov.info'
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

    grunt.loadNpmTasks('grunt-env');

    // Load the plugin that provides the jshint task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Load hapijs/lab
    grunt.loadNpmTasks('grunt-lab');

    // load Coveralls
    grunt.loadNpmTasks('grunt-coveralls');

    // Set default tasks
    grunt.registerTask('default', ['test', 'jshint', 'coveralls']);

    grunt.registerTask('test', ['env:dev', 'lab']);
};