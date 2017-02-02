(function() {
  'use strict';

  var sass = require('gulp-sass');
  var gulp = require('gulp');

  var config = {
    scssInput: './public/sass/*.scss',
    scssOutput: './public/css'
  };

  gulp.task('default', ['sass', 'sass:watch'], function() {
  });

  gulp.task('sass', function() {
    return gulp.src(config.scssInput)
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(config.scssOutput));
  });

  gulp.task('sass:watch', function() {
    gulp.watch(config.scssInput, ['sass']);
  });
})();
