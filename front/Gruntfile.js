'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */\n\n',

        copy: {
            assets: {
                files: [
                    /*
                     * Add your non-JS/non-CSS dependencies here
                     */

                    { // Copy Bootstrap fonts
                        expand: true,
                        cwd: 'bower_components/bootstrap/dist/',
                        src: 'fonts/**',
                        dest: '../public',     
                    },
                ]
            },
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            vendorjs: {
                src: [
                    /*
                     * Add your JS dependencies here, order is respected
                     */
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/bootstrap/dist/js/bootstrap.js',
                    'bower_components/moment/min/moment-with-locales.js',
                    'bower_components/moment-timezone/builds/moment-timezone-with-data.js',
                ],
                dest: '../public/js/vendor.js'
            },
            appjs: {
                src: 'js/**/*.js',
                dest: '../public/js/app.js',
            },
            vendorcss: {
                src: [
                    /*
                     * Add your CSS dependencies here, order is respected
                     */
                ],
                dest: '../public/css/vendor.css'
            },
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            vendorjs: {
                src: '<%= concat.vendorjs.dest %>',
                dest: '../public/js/vendor.min.js'
            },
            appjs: {
                src: '<%= concat.appjs.dest %>',
                dest: '../public/js/app.min.js'
            },
        },

        less: {
            appcss: {
                files: {
                    "../public/css/app.css": "less/app.less"
                },
            },
        },

        cssmin: {
            options: {
                banner: '<%= banner %>'
            },
            vendorcss: {
                src: '../public/css/vendor.css',
                dest: '../public/css/vendor.min.css'
            },
            appcss: {
                src: '../public/css/app.css',
                dest: '../public/css/app.min.css'
            },
        },

        watch: {
            js: {
                files: [ 'js/**/*' ],
                tasks: [ 'concat:appjs', 'uglify:appjs' ],
            },
            less: {
                files: [ 'less/**/*' ],
                tasks: [ 'less', 'cssmin:appcss' ],
            },
        },
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['copy', 'concat', 'uglify', 'less', 'cssmin']);
};
