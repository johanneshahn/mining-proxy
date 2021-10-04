module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),



    sass: {
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




     // Load the plugin that provides the "sass" task.
  grunt.loadNpmTasks('grunt-contrib-sass');

    // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

      // Load the plugin that provides the "concat" task.
  grunt.loadNpmTasks('grunt-contrib-concat');

   // Load the plugin that provides the "cssmin" task.
  grunt.loadNpmTasks('grunt-contrib-cssmin');

   // Default task(s).

  grunt.registerTask('default', ['sass', 'concat', 'uglify','cssmin' ]);
};
