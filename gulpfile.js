/*
  Gulp tasks for nerds.com.ve
 */

// The so-called gulp modules
var gulp       = require('gulp'),
    compass    = require('gulp-compass'),
    connect    = require('gulp-connect'),
    open       = require('gulp-open'),
    clean      = require('gulp-clean'),
    minifyHTML = require('gulp-minify-html'),
    ghPages    = require('gulp-gh-pages');

// Utilities

// http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

// Directories
var dir_build = 'build/',
    dir_dist  = 'dist/';

// Build tasks
gulp.task('build', ['html', 'styles', 'media', 'watch']);
gulp.task('build:dist', ['html:dist', 'styles:dist', 'media:dist']);

// Watch task
gulp.task('watch', function() {
  gulp.watch('scss/*.scss', ['styles'])
  gulp.watch('index.html', ['html'])
  gulp.watch('/media/**', ['media'])
});

// Build html

gulp.task('html', function() {
  return gulp.src('index.html')
  .pipe(gulp.dest(dir_build))
  .pipe(connect.reload());
});

gulp.task('html:dist', function(){
  return gulp.src('index.html')
  .pipe(minifyHTML({}))
  .pipe(gulp.dest(dir_dist));
});

// Media
media_dir = 'img/'; // this should be changed though

function task_media(dst_dir) {
  return gulp.src(media_dir + '**')
  .pipe(gulp.dest(dst_dir + media_dir));
}

gulp.task('media', function(){
  return task_media(dir_build);
});

gulp.task('media:dist', function(){
  return task_media(dir_dist);
});

// Compile SCSS (via compass)

function log_err (e) {
    //If you want details of the error in the console
    console.log(e.toString());
    this.emit('end');
}

function task_sass (options, dst_dir) {
  var opt_defaults = {
    css: 'css',
    sass: 'scss',
    bundle_exec: true
  }
  return gulp.src('scss/**/*.scss')
    .pipe(compass(merge_options(opt_defaults, options)))
    .on('error', log_err)
    .pipe(gulp.dest(dst_dir + '/css'))
}

gulp.task('styles', function() {
  return task_sass({style:'compact'}, dir_build).pipe(connect.reload());
});

gulp.task('styles:dist', function(){
  return task_sass({style:'compressed'}, dir_dist);
});


// Open a web browser window

var http_address = 'localhost';
var http_port    = '8080';

function task_open(dst_dir) {
  return gulp.src(dst_dir + '/index.html')
  .pipe(open('', {
    url:'http://' + http_address + ':' + http_port
  }));
}

gulp.task('open:www', ['connect'], function() {
  return task_open(dir_build);
});

gulp.task('open:www:dist', ['connect:dist'], function() {
  return task_open(dir_dist);
});

// Start a web server

function task_connect(options, dst_dir) {
  var opt_defaults = {root: dst_dir};
  return connect.server(merge_options(opt_defaults, options));
}

gulp.task('connect', ['build'], function() {
  return task_connect({livereload: true}, dir_build);
});

gulp.task('connect:dist', ['build:dist'], function() {
  return task_connect(dir_dist);
});

//
gulp.task('serve', ['open:www']);
gulp.task('serve:dist', ['open:www:dist']);

//
gulp.task('clean', function() {
  gulp.src(dir_dist,  {read: false})
  .pipe(clean({force:true}))
  gulp.src(dir_build, {read: false})
  .pipe(clean({force:true}))
  gulp.src('.sass-cache', {read: false})
  .pipe(clean({force:true}))
  gulp.src('css', {read: false})
  .pipe(clean({force:true}))
});

// Deploy
gulp.task('deploy', ['build:dist'], function(){
  return gulp.src(dir_dist + '**')
         .pipe(ghPages({branch:'gh-pages'}));
});
