var gulp = require('gulp');
var gutil = require('gulp-util');
var express = require('express');
var path = require('path');
var tinylr = require('tiny-lr');
var sass = require('gulp-sass');
var open = require('gulp-open');

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

  gulp.watch(["app/**/*", ".tmp2/**/*", "!app/bower_components/**/*"], function(evt) {
    gutil.log(gutil.colors.cyan(evt.path), 'changed');
    servers.lr.changed({
      body: {
        files: [evt.path]
      }
    });
  });

  gulp.watch(["app/styles/**/*.scss"], function(evt) {
    gulp.run('sass');
  });
});
