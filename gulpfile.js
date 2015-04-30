/* jshint node:true */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('injectScss', function() {

    var target = gulp.src('client/styles/main.scss');
    var sources = gulp.src(['client/styles/modules/**/*.scss'], {read: false});

    return target.pipe($.inject(sources, {
        starttag: '// inject:scss',
        endtag: '// endinject',
        relative: true,
        transform: function (filepath) {
            // Return path without file ext
            return '\'' + filepath.slice(0, -5) + '\',';
        }
    }))
    .pipe(gulp.dest('client/styles'));
});

gulp.task('styles', ['injectScss'], function() {
    return gulp.src('client/styles/main.scss')
        .pipe($.plumber())
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer({
            browsers: ['last 1 version']
        }))
        .pipe(gulp.dest('.tmp/styles/temp'));
});

gulp.task('pixrem', ['styles'], function() {
    return gulp.src('.tmp/styles/temp/main.css')
        .pipe($.pixrem('17px'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(gulp.dest('client/styles'));
});

gulp.task('jshint', function() {
    return gulp.src('client/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('html', ['pixrem'], function() {
    var assets = $.useref.assets({
        searchPath: '{.tmp,app}'
    });

    return gulp.src('client/*.html')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if('*.html', $.minifyHtml({
            conditionals: true,
            loose: true
        })))
        .pipe(gulp.dest('dist/client'));
});

gulp.task('images', function() {
    return gulp.src('client/images/**/*')
        .pipe($.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/client/images'));
});

gulp.task('fonts', function() {
    return gulp.src(require('main-bower-files')().concat('client/fonts/**/*'))
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/client/fonts'));
});

gulp.task('extras', function() {
    return gulp.src([
        'client/*.*',
        '!client/*.html',
        'node_modules/apache-server-configs/dist/.htaccess'
    ], {
        dot: true
    }).pipe(gulp.dest('dist/client'));
});

gulp.task('server', function () {
    return gulp.src(['server/**/*'], { dot: true })
        .pipe(gulp.dest('dist/server'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['pixrem'], function() {
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var client = require('connect')()
        .use(require('connect-livereload')({
            port: 35729
        }))
        .use(serveStatic('.tmp'))
        .use(serveStatic('app'))
        // paths to bower_components should be relative to the current file
        // e.g. in client/index.html you should use ../bower_components
        .use('/bower_components', serveStatic('bower_components'))
        .use(serveIndex('app'));

    require('http').createServer(client)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect', 'watch'], function() {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;

    gulp.src('client/styles/*.scss')
        .pipe(wiredep())
        .pipe(gulp.dest('client/styles'));

    gulp.src('client/*.html')
        .pipe(wiredep())
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function() {
    $.livereload.listen();

    // watch for changes
    gulp.watch([
        'client/*.html',
        '.tmp/styles/**/*.css',
        'client/scripts/**/*.js',
        'client/images/**/*'
    ]).on('change', $.livereload.changed);

    gulp.watch('client/styles/**/*.scss', ['pixrem']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras', 'server'], function() {
    return gulp.src('dist/client/**/*').pipe($.size({
        title: 'build',
        gzip: true
    }));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});