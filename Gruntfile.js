const fs = require('fs');
const npm = /^win/.test(process.platform)
    ? 'npm.cmd'
    : 'npm';

module.exports = function (grunt) {

    const version = "0.1." + process.env.TRAVIS_BUILD_NUMBER;

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
        exec: {
            setVersion: {
                cwd: 'dist',
                command: `${npm} version ${version} --no-git-tag-version --allow-same-version`
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

    grunt.registerTask('build', ['clean:dist', 'babel', 'copy', 'exec:setVersion']);
};