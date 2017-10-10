const fs = require('fs');
const npm = /^win/.test(process.platform)
    ? 'npm.cmd'
    : 'npm';

module.exports = function (grunt) {

    const version = "0.1." + process.env.CI_JOB_ID;
    const packageName = "fulfillment-location-service";
    const packageTar = `${packageName}-${version}.tgz`;

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
            },
            createTar: {
                cwd: 'dist',
                command: `${npm} pack`
            }
        },
        babel: {
            options: {
                sourceMap: true,
            },
            dist: {
                files: {
                    'dist/index.js': 'src/index.js'
                }
            }
        }
    });

    grunt.registerTask('buildProps', function () {
        fs.writeFileSync('build_properties.ini', `GIT_TAG_NAME=${version}\nPACKAGE_VERSION=${version}\n`);
    });

    grunt.registerTask('build', ['buildProps', 'clean:dist', 'babel', 'copy']);
    grunt.registerTask('prepublish', ['exec:setVersion', 'exec:createTar']);
    grunt.registerTask('publish', ['exec:pushToAWS']);
};