'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    express = require('express'),
    path = require('path'),
    tinylr = require('tiny-lr'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs');

var createServers = function(port, lrport) {
  var lr = tinylr();
  lr.listen(lrport, function() {
    gutil.log('LR Listening on', lrport);
  });

  var app = express();
  app.use(express.query())
    .use(express.bodyParser())
    .use(express.static(path.resolve('app')))
    .use(express.directory(path.resolve('app')))
    .use(express.static(path.resolve('.tmp2')))
    .use(express.directory(path.resolve('.tmp2')))
    .listen(port, function() {
      gutil.log('Listening on', port);
    });

  return {
    lr: lr,
    app: app
  };
};

gulp.task('sass', function () {
  gulp.src('app/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('.tmp2/styles'));
});

gulp.task('default', function(){
  var servers = createServers(8080, 35729);

  gulp.watch(['app/**/*', '.tmp2/**/*', '!app/bower_components/**/*'], function(evt) {
    gutil.log(gutil.colors.cyan(evt.path), 'changed');
    servers.lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });

  gulp.watch(['app/styles/**/*.scss'], function(/*evt*/) {
    gulp.run('sass');
  });
  gulp.run('sass');
});

gulp.task('lint', function() {
  gulp.src(['gulpfile.js', 'app/scripts/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
  gulp.src(['gulpfile.js', 'app/scripts/**/*.js'])
    .pipe(jscs());
});
