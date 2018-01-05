/**
 * Initialize the variables
 */

var app,
    base,
    concat,
    directory,
    gulp,
    gutil,
    hostname,
    path,
    refresh,
    sass,
    uglify,
    imagemin,
    minifyCSS,
    del,
    browserSync,
    autoprefixer,
    gulpSequence,
    shell,
    sourceMaps,
    plumber;


/**
 * Configures the autoprefixer
 */

 var autoPrefixBrowserList = ['last 2 version'];


/**
 * Load the dependencies
 */

gulp          = require('gulp');
gutil         = require('gulp-util');
concat        = require('gulp-concat');
uglify        = require('gulp-uglify');
sass          = require('gulp-sass');
sourceMaps    = require('gulp-sourcemaps');
imagemin      = require('gulp-imagemin');
minifyCSS     = require('gulp-minify-css');
browserSync   = require('browser-sync');
autoprefixer  = require('gulp-autoprefixer');
gulpSequence  = require('gulp-sequence').use(gulp);
shell         = require('gulp-shell');
plumber       = require('gulp-plumber');


/**
 * Browser Sync
 */

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: "application/"
    },
    options: {
      reloadDelay: 250
    },
    notify: false
  });
});





/*------------------------------------*\
  The Styles
\*------------------------------------*/


/**
 * The Styles for the local environment
 */

gulp.task('styles', function() {

  return gulp.src('application/styles/scss/default.scss')

  // With this we prevent pipe breaking if any suspicious error appears
  .pipe(plumber({
    errorHandler: function (err) {
      console.log(err);
      this.emit('end');
    }
  }))

  // Let's get sourceMaps ready!
  .pipe(sourceMaps.init())

  // Include SCSS and list every "include" folder:
  .pipe(sass({
    errLogToConsole: true,
    includePaths: [
      'application/styles/scss/'
    ]
  }))

  .pipe(autoprefixer({
    browsers: autoPrefixBrowserList,
    cascade:  true
  }))

  // Any errors? Catch 'em!
  .on('error', gutil.log)

  // Let's put the name the final CSS file:
  .pipe(concat('styles.css'))

  // Remember the sourceMaps? Let's get our sources from it
  .pipe(sourceMaps.write())

  // This is where we'll save our final, compressed and amazing CSS file:
  .pipe(gulp.dest('application/styles'))

  // Kindly ask browserSync to refresh
  .pipe(browserSync.reload({stream: true}));
});


/**
 * The Styles for deployment
 */

gulp.task('styles-deploy', function() {

  return gulp.src('application/styles/scss/default.scss')

  .pipe(plumber())

    // include SCSS includes folder
    .pipe(sass({
      includePaths: [
        'application/styles/scss',
      ]
    }))

    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade:  true
    }))

    // Let's put the name the final CSS file:
    .pipe(concat('styles.css'))

    .pipe(minifyCSS())

    // This is where we'll save our final, compressed and amazing CSS file:
    .pipe(gulp.dest('dist/styles'));
});





/*------------------------------------*\
  The HTMLs
\*------------------------------------*/


/**
 * Just listen for changes in the HTML files, then refresh the page
 */

gulp.task('html', function() {
  return gulp.src('application/*.html')
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}))

    // Any errors? Catch 'em!
    .on('error', gutil.log);
});


/**
 * Prepare all the HTML files for deployment
 */

gulp.task('html-deploy', function() {

  // TAKE ALL THE FILES!
  gulp.src('application/*')

  // With this we prevent pipe breaking if any suspicious error appears
  .pipe(plumber())
  .pipe(gulp.dest('dist'));

  // Don't forget the hidden files.
  gulp.src('application/.*')

  // With this we prevent pipe breaking if any suspicious error appears
  .pipe(plumber())
  .pipe(gulp.dest('dist'));

  // Nor the fonts
  gulp.src('application/fonts/**/*')

  // With this we prevent pipe breaking if any suspicious error appears
  .pipe(plumber())
  .pipe(gulp.dest('dist/fonts'));

  // Or the styles
  gulp.src(['application/styles/*.css', '!application/styles/styles.css'])

  // With this we prevent pipe breaking if any suspicious error appears
  .pipe(plumber())
  .pipe(gulp.dest('dist/styles'));
});






/*------------------------------------*\
  The Images
\*------------------------------------*/


/**
 * Compress the images and handle the SVG files
 */

gulp.task('images', function(tmp) {
  gulp.src(['application/images/*.jpg', 'application/images/*.png'])

    // With this we prevent pipe breaking if any suspicious error appears
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('application/images'));
});


/**
 * Compress the images and handle the SVG files, but this time for deployment
 */

gulp.task('images-deploy', function() {
  gulp.src(['application/images/**/*', '!application/images/README'])

    // With this we prevent pipe breaking if any suspicious error appears
    .pipe(plumber())
    .pipe(gulp.dest('dist/images'));
});






/*------------------------------------*\
  The Scripts
\*------------------------------------*/


/**
 * The Scripts for the local environment
 */

gulp.task('scripts', function() {
  // Where are they?
  return gulp.src(['application/scripts/src/_partials/**/*.js', 'application/scripts/src/**/*.js'])

    // With this we prevent pipe breaking if any suspicious error appears
    .pipe(plumber())
    //this is the filename of the compressed version of our JS
    .pipe(concat('app.js'))
    //catch errors
    .on('error', gutil.log)
    //where we will store our finalized, compressed script
    .pipe(gulp.dest('application/scripts'))
    //notify browserSync to refresh
    .pipe(browserSync.reload({stream: true}));
});


/**
 * The Scripts for deployment
 */

gulp.task('scripts-deploy', function() {
  // Where are they?
  return gulp.src(['application/scripts/src/_partials/**/*.js', 'application/scripts/src/**/*.js'])

    // With this we prevent pipe breaking if any suspicious error appears
    .pipe(plumber())

    //this is the filename of the compressed version of our JS
    .pipe(concat('app.js'))

    //compress :D
    .pipe(uglify())

    //where we will store our finalized, compressed script
    .pipe(gulp.dest('dist/scripts'));
});





/*------------------------------------*\
  Scaffolding tasks
\*------------------------------------*/


/**
 * Clean the dist directory
 */

gulp.task('clean', function() {
  return shell.task([
    'rm -rf dist'
  ]);
});


/**
 * Creates the folders using shell
 */

 gulp.task('scaffold', function() {
  return shell.task([
      'mkdir dist',
      'mkdir dist/fonts',
      'mkdir dist/images',
      'mkdir dist/scripts',
      'mkdir dist/styles'
    ]
  );
});





/*------------------------------------*\
  The main tasks
\*------------------------------------*/


/**
 * Heads up! This is the main task when the "gulp" command is ran.
 *
 * We can use this task when developing. This will start the web server,
 * start the browserSync and compress all the scripts and styles files.
 */

gulp.task('default', ['browserSync', 'scripts', 'styles'], function() {
  // Execute the task according to the changed directory.
  gulp.watch('application/scripts/src/**', ['scripts']);
  gulp.watch('application/styles/scss/**', ['styles']);
  gulp.watch('application/images/**', ['images']);
  gulp.watch('application/*.html', ['html']);
});


/**
 * This task prepares everything for deployment.
 */

gulp.task('deploy', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));