const fs = require('fs');

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        clean: {
            dist: ['dist/']
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    src: ['package.json', '*.md'],
                    dest: 'dist/',
                    filter: 'isFile'
                }]
            }
        },
        babel: {
            options: {
                sourceMap: true,
            },
            dist: {
                files: {
                    'dist/index.js': 'src/index.js',
                    'dist/fulfillmentLocation.js': 'src/fulfillmentLocation.js'
                }
            }
        }
    });

    grunt.registerTask('build', ['clean:dist', 'babel', 'copy']);
};