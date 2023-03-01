var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    server = require('gulp-server-livereload'),
    uglify = require('gulp-uglify'),
    gzip = require('gulp-gzip');

gulp.task('default', ['build', 'watch', 'server']);

gulp.task('build', ['scss', 'js', 'html']);

gulp.task('watch', function() {
  gulp.watch('src/scss/**/*.scss', ['scss']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/html/**/*.html', ['html']);
});

gulp.task('scss', function() {
  return gulp
    .src('src/scss/game.scss')
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: ['../resources/scss']
    }))
    .on('error', function(e) {
      console.log(e);
      this.emit('end');
    })
    .pipe(gulp.dest('public/assets/css'));
});

gulp.task('js', function() {
  return gulp
    .src('src/js/*.js')
    .pipe(browserify({
      insertGlobals: true,
      paths: ['../resources/js']
    }))
    .on('error', function(err) {
      console.log(err);
      this.emit('end');
    })
    .pipe(uglify())
    .pipe(gulp.dest('public/assets/js'));
});

gulp.task('html', function() {
  return gulp
    .src('src/html/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('public'));
});

gulp.task('server', function() {
  return gulp
    .src('public')
    .pipe(server({
      host: '0.0.0.0',
      livereload: {
        enable: true
      }
    }));
});

function gzipTarget(target, ext) {
  return gulp
    .src(target + '*' + ext)
    .pipe(gzip())
    .pipe(gulp.dest(target));
};

gulp.task('gzip.css', ['scss'], function() { return gzipTarget('public/assets/css/', '.css'); });
gulp.task('gzip.js', ['js'], function() { return gzipTarget('public/assets/js/', '.js'); });
gulp.task('gzip.html', ['html'], function() { return gzipTarget('public/', '.html'); });

gulp.task('deploy', ['gzip.css', 'gzip.js', 'gzip.html'], function(cb) {
  var execSync = require('child_process').execSync,
      chalk = require('chalk'),
      prompt = require('prompt'),
      s3 = require('gulp-s3'),

      targets = require('./targets.json'),
      branch = execSync('git rev-parse --abbrev-ref HEAD').toString().replace(/\n/, ''),

      target = 'staging',

      schemaTarget = function() {
        return {
          target: {
            description: chalk.cyan('Deploy to:'),
            default: target,
            required: true,
            pattern: /^(staging|production|staging-uk|production-uk)$/
          }
        };
      },
      schemaConfirmation = function(branch, isBranchError) {
        var description = 'Confirm deploying to ' + branch + ':';

        if (isBranchError)
          description = "You're not on the right branch, deploy anyway?";

        return {
          confirm: {
            description: chalk.cyan(description),
            required: true,
            default: 'yes',
            pattern: /^(yes|no)$/
          }
        };
      };

  function startDeploy() {
    console.log(chalk.green('> Executing deploy to %s'), target);

    var aws = require('./targets.json')[target];

    gulp
      .src('./public/**')
      .pipe(
        s3(aws, { gzippedOnly: true })
      );

    gulp
      .src('./public/assets/img/**')
      .pipe(
        s3(aws, { uploadPath: 'assets/img/' })
      );

    gulp
      .src('./public/assets/fonts/**')
      .pipe(
        s3(aws, { uploadPath: 'assets/fonts/' })
      );

    gulp
      .src('./public/favicon.ico')
      .pipe(
        s3(aws)
      );

    gulp
      .src('./public/manifest.json')
      .pipe(
        s3(aws)
      );

    cb();
  };

  prompt.message = prompt.delimiter = '';

  prompt.start();

  prompt.get({ properties: schemaTarget() }, function(err, result) {
    if (err)
      return console.log('');;

    if ((result.target === 'production' || result.target === 'production-uk') && branch !== 'master')
      return console.log(chalk.red('Error:'), 'You must be on branch', chalk.cyan('master'), 'to deploy to production.');

    var isBranchError = (result.target === 'staging' || result.target === 'staging-uk') && branch !== 'staging',
        requestedTarget = result.target;

    prompt.get({ properties: schemaConfirmation(requestedTarget, isBranchError) }, function(err, result) {
      if (err || result.confirm !== 'yes')
        return console.log(chalk.red('\nCanceled deploy'));

      target = requestedTarget;

      startDeploy();
    });
  });

});
