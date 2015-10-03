var fs = require('fs')
var gulp = require('gulp')
var babel = require('gulp-babel')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var Handlebars = require('handlebars')

gulp.task('js', function() {
  return gulp.src('src/*.jsx')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
})

gulp.task('build', ['js'], function() {
  var template = function(name) {
    return Handlebars.compile(fs.readFileSync(name, {encoding: 'utf-8'}))
  }
  var index_html = template('src/index.html')({t: (new Date()).getTime()})
  fs.writeFileSync('build/index.html', index_html)
  fs.writeFileSync('build/style.css', fs.readFileSync('src/style.css'))
})

gulp.task('devel', ['build'], function() {
  gulp.watch('src/*.jsx', ['build'])
})

gulp.task('default', ['build'])
