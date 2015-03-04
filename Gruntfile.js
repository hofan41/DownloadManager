module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			options: {
				camelcase: true,
				bitwise: true,
				curly: true,
				eqeqeq: true,
				forin: true,
				freeze: true,
				newcap: true,
				noarg: true,
				noempty: true,
				nonbsp: true,
				nonew: true,
				quotmark: true,
				singleGroups: true,
				undef: true,
				globals: {
					jQuery: false,
					console: false,
					module: false,
					process: false,
					require: false,
					__dirname: false
				}
			},
			files: ['Gruntfile.js', 'index.js']
		}
	});

	// Load the plugin that provides the "jshint" task.
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Set default tasks
	grunt.registerTask('default', ['jshint']);
};