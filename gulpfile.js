var gulp = require("gulp");
var concat = require("gulp-concat");
var jade = require("gulp-jade");
var react = require('gulp-react');
var sourcemaps = require("gulp-sourcemaps");

gulp.task("react-components", function() {
  return gulp.src('src/popup/components/*.js')
    .pipe(react())
    .pipe(gulp.dest('build/components'));
});

gulp.task("javascript", ['react-components'], function() {
  gulp.src([
    "bower_components/faye/include.js",
    "bower_components/lodash/dist/lodash.js",
    "src/background/app/chat-history.js",
    "src/background/dev-env.js",
    "src/background/app.js"
    ]).pipe(sourcemaps.init())
    .pipe(concat('background.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/js"));

  gulp.src([
    "bower_components/ratchet/dist/js/ratchet.js",
    "bower_components/react/react.js",
    "build/components/*.js"
    ]).pipe(sourcemaps.init())
    .pipe(concat('popup.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("build/js"));
});

gulp.task("default", function() {
  gulp.run("javascript");

  gulp.src([
    "bower_components/ratchet/dist/css/ratchet.css",
    "bower_components/ratchet/dist/css/ratchet-theme-ios.css",
    "src/popup/assets/style.css"
    ]).pipe(concat("popup.css"))
    .pipe(gulp.dest("build/css"));

  gulp.src(["bower_components/ratchet/dist/fonts/**"]).
    pipe(gulp.dest("build/fonts"));

  gulp.src(["src/popup/assets/icon.png"]).pipe(gulp.dest("build/images"));

  gulp.src("src/popup/index.jade").pipe(jade({})).pipe(gulp.dest("build"));
});
