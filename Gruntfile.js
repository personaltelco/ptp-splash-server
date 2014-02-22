module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),
		uglify: {
			options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:MM") %> */\n',
                mangle: false,
                compress: true,
                beautify: false
			},
			build: {
				src: [
                    './src/bower_components/dustjs/dist/dust-full-0.3.0.js',
                    './src/bower_components/async/lib/async.js',
                    './src/*.js'
                ],
                dest: './htdocs/js/<%= pkg.name %>.min.js'
			}
        },
        exec: {
            dust_news: {
                cmd: "./node_modules/.bin/dustc --name=news ./src/dustjs/news.html ./src/_dust_news.js"
            },
            dust_tweet: {
                cmd: "./node_modules/.bin/dustc --name=tweet ./src/dustjs/tweet.html ./src/_dust_tweet.js"
            },
            dust_rss: {
                cmd: "./node_modules/.bin/dustc --name=rss ./src/dustjs/rss.html ./src/_dust_rss.js"
            },
            dust_about: {
                cmd: "./node_modules/.bin/dustc --name=about ./src/dustjs/about.html ./src/_dust_about.js"
            },
        },
        watch: {
            scripts: {
                files: ['./src/*.js', 
                        './src/dustjs/*.html', 
                        './htdocs/css/*.css', 
                        './htdocs/*.html'
                ],
                tasks: ['dust','uglify'],
                options: {
                    spawn: false,
                    livereload: true,
                },
            },
        },
	});

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');
      
    // Default task(s).
    grunt.registerTask('dust', ['exec:dust_news', 'exec:dust_tweet', 'exec:dust_rss', 'exec:dust_about']);
    grunt.registerTask('default', ['dust','uglify']);

};