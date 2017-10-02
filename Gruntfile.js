module.exports = function(grunt) {
	  grunt.initConfig({
		src_path: 'src/views',
		dist_path: 'dist/views',
		pkg: grunt.file.readJSON('package.json'),

		htmlmin: {
		   dist: {
			  options: {
				 removeComments: true,
				 collapseWhitespace: true
			  },
			  files: {
				 '<%= dist_path %>/index.htm' : '<%= src_path %>/index.htm' /* destination : source */
			  }
		   }
		},
	
  /* MINIFY JS */
  uglify: {
	  options: {
		sourceMap: true,
		// the banner is inserted at the top of the output
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
	  },
	  dist: {
		files: {
		  '<%= dist_path %>/js/knockout.js': ['<%= src_path %>/js/knockout.js'],
		  '<%= dist_path %>/js/app.js': ['<%= src_path %>/js/app.js']
		}
	  }
	},
  
  /* MINIFY CSS */
  cssmin: {
	   dist: {
		  options: {
			 banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
		  },
		  files: {
			 '<%= dist_path %>/css/style.css': ['<%= src_path %>/css/style.css'],
			 '<%= dist_path %>/css/bootstrap.css': ['<%= src_path %>/css/bootstrap.css']
		  }
	  }
	},
	
	/* MINIFY IMAGES */
	imagemin: {
		dist: {
			options: {
				optimizationLevel: 7,
				progressive: true
			},
			files: [{
				expand: true,
				cwd: '<%= src_path %>/img/',
				src: ['**/*.{png,jpg,gif}'],
				dest: '<%= dist_path %>/img/'
			}]
		}
	},
	
	jshint: {
      files: ['Gruntfile.js', 'src/js/*'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
  
  /* WATCH FOR CHANGES */
  watch: {
	  html: {
		  files: ['<%= src_path %>/*html'],
		  tasks: ['html:dev']
	  },
      css: {
        files: ['<%= src_path %>/css/*.css'],
        tasks: ['css:dev']
      },
      js: {
        files: ['<%= src_path %>/js/*.js'],
        tasks: ['uglify:dev']
      }
    }
   });
   
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('default', ['jshint', 'imagemin', 'htmlmin', 'cssmin', 'uglify']);
  
};