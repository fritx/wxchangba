var gulp = require('gulp')
var plumber = require('gulp-plumber')
var less = require('gulp-less')
var autoprefixer = require('gulp-autoprefixer')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
var minifycss = require('gulp-minify-css')
//var cssmin = require('gulp-cssmin')
var del = require('del')

gulp.task('zepto', function(){
  // 控制并发时记得返回
  return gulp.src([
    // zeptojs/make :L42 @modules 'zepto event ajax form ie'
    'bower_components/zeptojs/src/zepto.js',
    'bower_components/zeptojs/src/event.js',
    'bower_components/zeptojs/src/ajax.js',
    'bower_components/zeptojs/src/form.js',
    'bower_components/zeptojs/src/ie.js'
    ])
    .pipe(plumber())
    .pipe(concat('zepto.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/dist'))
})
gulp.task('misc', function () {
  return gulp.src([
    'static/lib/**',
    //'bower_components/animate.css/animate.min.css',
    //'bower_components/jquery/dist/jquery.min.js',
    //'bower_components/jquery/dist/jquery.min.map',
    //'bower_components/lodash/lodash.min.js',
    'bower_components/jquery.serializeJSON/jquery.serializejson.min.js'
    ])
    .pipe(plumber())
    //.pipe(uglify())
    .pipe(gulp.dest('static/dist'))
})
gulp.task('modern', ['misc'], function () {
  return gulp.src([
    'static/dist/modern/css/modern.css',
    'static/dist/modern/css/modern-responsive.css'
    ])
    .pipe(plumber())
    .pipe(concat('modern.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('static/dist/modern/css'))
})
gulp.task('external', ['zepto', 'misc', 'modern'])

gulp.task('less', function () {
  return gulp.src([
    'src/web/admin.less',
    'src/web/common.less'
    ])
    .pipe(plumber())
    .pipe(less())
    .pipe(autoprefixer({
      browsers: 'Android 4, iOS 6, last 20 versions'
    }))
    .pipe(minifycss({
      processImport: false // 不处理@import
    }))
    .pipe(gulp.dest('static/dist/app'))
})
gulp.task('js', function () {
  return gulp.src([
    'src/web/**/*.js'
    ])
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('static/dist/app'))
})
gulp.task('source', ['less', 'js'])

gulp.task('clean', function (cb) {
  del([
    'static/dist'
  ], cb)
})
gulp.task('build', ['external', 'source'])

gulp.task('watch', function () { // watch需要单独开
  gulp.watch('src/web/**/*.less', ['less'])
  gulp.watch('src/web/**/*.js', ['js'])
  //gulp.watch('src/web/**/*.html', ['html'])
})

gulp.task('default', ['source'])
