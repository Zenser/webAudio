var gulp = require('gulp'),
    concat = require('gulp-concat'),
    del = require('del'),
    ngHtml2Js = require('gulp-ng-html2js'),
    sass = require('gulp-sass');
;

gulp.task('compress',function(){
    gulp.src('src/**/*.js')
        .pipe(concat('ngAudio.js'))
        .pipe(gulp.dest('dist/'));
    gulp.src('src/**/*.html')
        .pipe(ngHtml2Js({
            moduleName: 'ngAudio',
            declareModule: false
        }))
        .pipe(concat("templates.js"))
        .pipe(gulp.dest('dist/'));

    gulp.src('src/*.scss')
        .pipe(sass.sync())
        .pipe(concat('index.css'))
        .pipe(gulp.dest('dist/'));
});