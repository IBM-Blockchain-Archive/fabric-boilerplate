module.exports = function (grunt) {
    "use strict";

    var outDir = 'server';
    var buildTasks = ['newer:tslint', 'clean', 'concurrent:build'];

    grunt.initConfig({
        watch: {
            ts: {
                files: 'src/**/*.ts',
                tasks: buildTasks
            }
        },
        ts: {
            default: {
                tsconfig: true
            }
        },
        tslint: {
            options: {
                configuration: 'tslint.json',
                rulesDirectory: 'node_modules/tslint-microsoft-contrib'
            },
            files: {
                src: ['src/**/*.ts', '!src/build-chaincode/**']
            }
        },
        clean: ['./server'],
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            run: ['nodemon', 'watch'],
            build: ['ts', 'copy']
        },
        nodemon: {
            dev: {
                script: outDir + '/app.js',
                watch: [outDir],
                delay: 1000,
                ext: 'js',
                legacyWatch: true,
                options: {
                    env: {
                        PORT: 8080,
                        NODE_ENV: 'development'
                    }
                }
            }
        },
        copy: {
            default: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        src: ['resources/*'],
                        dest: 'dist/'
                    }
                ]
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', ['build', 'concurrent:run']);
};