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
                    './node_modules/dustjs-linkedin/dist/dust-full.min.js',
                    './node_modules/async/lib/async.js',
                    './src/dustjs/compiled/*.js',
                    './config/config.js',
                    './src/*.js'
                ],
                dest: './htdocs/js/<%= pkg.name %>.min.js'
			}
        },
        cssmin : {
            add_banner : {
                options : {
                    banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd hh:MM") %> */\n',
                },
                files : {
                    'htdocs/css/<%= pkg.name %>.min.css' : [
                            'src/css/ptp-splash-server.css' ]
                }
            }
        },
        exec: {
            dust_news: {
                cmd: "./node_modules/.bin/dustc --name=news ./src/dustjs/news.html ./src/dustjs/compiled/_dust_news.js"
            },
            dust_tweet: {
                cmd: "./node_modules/.bin/dustc --name=tweet ./src/dustjs/tweet.html ./src/dustjs/compiled/_dust_tweet.js"
            },
            dust_rss: {
                cmd: "./node_modules/.bin/dustc --name=rss ./src/dustjs/rss.html ./src/dustjs/compiled/_dust_rss.js"
            },
            dust_about_video: {
                cmd: "./node_modules/.bin/dustc --name=about_video ./src/dustjs/about_video.html ./src/dustjs/compiled/_dust_about_video.js"
            },
            dust_about_nodes: {
                cmd: "./node_modules/.bin/dustc --name=about_nodes ./src/dustjs/about_nodes.html ./src/dustjs/compiled/_dust_about_nodes.js"
            },
        },
        watch: {
            scripts: {
                files: ['./src/*.js', 
                        './src/dustjs/*.html', 
                        './src/css/*.css', 
                        './htdocs/*.html'
                ],
                tasks: ['dust','uglify','cssmin'],
                options: {
                    spawn: false,
                    livereload: false,
                },
            },
        },
	});

    // Load the plugin that provides the task
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('dust', ['exec:dust_news', 'exec:dust_tweet', 'exec:dust_rss', 'exec:dust_about_video', 'exec:dust_about_nodes']);
    // Default task(s) that run if you just type 'grunt'
    grunt.registerTask('default', ['dust','uglify','cssmin']);

};