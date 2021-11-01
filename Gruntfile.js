module.exports = function(grunt) {
    
    
  /* new add to all gruntfiles */
  const sass = require('node-sass');
  require('load-grunt-tasks')(grunt);
  /* new add to all gruntfiles */
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),



    sass: {
        options: {
            implementation: sass,
            sourceMap: true,
        },
        dist: {
            options: {
                loadPath: ['./node_modules/bootstrap/scss']
            },
            files: {
                'sass/css/nodejsproxy.css' : 'sass/nodeproxy.scss'
            }
        }
    },

    concat: {
        options: {

            stripBanners: true,
             banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },

        dist: {
            src: ['sass/main.js', 'node_modules/chart.js/dist/chart.js'],
            dest: 'sass/js/concat.js'
        }
    },


    uglify:{
        options: {
            manage: true,
            preserveComments: 'all' //preserve all comments on JS files
        },
        my_target:{
            files: {
                'public/assets/dist/js/nodejsproxy.min.js' : [
                  'sass/js/concat.js',


                ]
            }
        }
    },


    cssmin:{
        my_target:{
            files: [{
                expand: true,
                cwd: 'sass/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'public/assets/dist/css/',
                ext: '.min.css'

            }]
        }
    }

  });




  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-modernizr');

   // Default task(s).

  grunt.registerTask('default', ['sass', 'concat', 'uglify','cssmin' ]);
};
