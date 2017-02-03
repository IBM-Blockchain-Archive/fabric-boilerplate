module.exports = function (grunt) {
    "use strict";

    let outDir = 'dist';
    let buildTasks = ['newer:tslint', 'clean', 'concurrent:build'];

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
        clean: ['./' + outDir],
        concurrent: {
            options: {
                logConcurrentOutput: true
            },
            run: ['nodemon', 'watch'],
            build: ['ts']
        },
        nodemon: {
            dev: {
                script: outDir + '/app.js',
                watch: [outDir],
                delay: 2000,
                ext: 'js',
                legacyWatch: true,
                options: {
                    env: {
                        PORT: 8080,
                        NODE_ENV: 'development'
                    }
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', buildTasks);
    grunt.registerTask('default', ['build', 'concurrent:run']);
};