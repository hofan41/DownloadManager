'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                /*
                 * ENVIRONMENTS
                 * =================
                 */

                // Define globals exposed by modern browsers.
                browser: true,

                // Define globals exposed by jQuery.
                jquery: true,

                // Define globals exposed by Node.js.
                node: true,

                /*
                 * ENFORCING OPTIONS
                 * =================
                 */

                // Force all variable names to use camelCase style
                // with underscores.
                camelcase: true,

                // Prohibit use of == and != in favor of === and !==.
                eqeqeq: true,

                // Prohibit use of a variable before it is defined.
                latedef: true,

                // Enforce line length to 80 characters
                maxlen: 80,

                // Require capitalized names for constructor functions.
                newcap: true,

                // Enforce use of single quotation marks for strings.
                quotmark: 'single',

                // Enforce placing 'use strict' at the top function scope
                strict: true,

                // Prohibit use of explicitly undeclared variables.
                undef: true,

                // Warn when variables are defined but never used.
                unused: true,

                /*
                 * RELAXING OPTIONS
                 * =================
                 */

                // Suppress warnings about == null comparisons.
                eqnull: true,

                globals: {
                    io: true,
                    moment: false
                }
            },
            files: ['*.js', 'handlers/**/*.js', 'test/**/*.js',
                'public/**/*.js'
            ]
        }
    });

    // Load the plugin that provides the jshint task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Set default tasks
    grunt.registerTask('default', ['jshint']);
};