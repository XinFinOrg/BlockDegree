const gulp = require('gulp');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const livereload = require('gulp-livereload');
const sass = require('gulp-sass');

const handlebars = require('gulp-compile-handlebars');
const metalsmith = require('gulp-metalsmith');
const markdown = require('metalsmith-markdown');
const templates = require('metalsmith-templates');

const bs = require('browser-sync').create();
const reload = bs.reload;

const courseData = require('./dist/data/courses.json');
const courses = courseData['courses'];

sass.compiler = require('node-sass');

gulp.task('compileCourseOverview', (done) => {
  for(var i=0; i<courses.length; i++){
    let course = courses[i],
        fileName = course.slug;
    console.log('Going through: ' + fileName);

    gulp.src('./src/partials/layouts/courseOverview.hbs')
      .pipe(handlebars(course, {
        batch: ['./src/partials'],
        helpers: {
          url: function(options) {
            let removeSpecial = options.replace(/[^\w\s]/gi, '');
            return removeSpecial.replace(/ +/g, '-').toLowerCase();
          }
        }
      }))
      .pipe(rename(fileName + '.html'))
      .pipe(gulp.dest('dist/courses'));
  }
  done();
});

gulp.task('clean-courses', () => {
  return gulp.src('./src/courses', {read: false})
    .pipe(clean());
});

gulp.task('metalsmith', () => {
  return gulp.src('./src/_data/**/*.md')
    .pipe(metalsmith({
      use: [
        markdown(),
        templates({
          "engine": "handlebars",
          "directory": "./src/partials/layouts"
        })]
    }))
    .pipe(handlebars({}, {
      batch: ['./src/partials']
    }))
    .pipe(rename(function(path){
      path.basename = path.basename.replace(/^[0-9]+_/g, '')
    }))
    .pipe(gulp.dest('./dist/courses'))
});

gulp.task('html', () => {
  return gulp.src('./src/pages/**/*.html')
    .pipe(handlebars({}, {
      noEsape: true,
      batch: ['./src/partials']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', () => {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./dist/css/'));
});


gulp.task('watch', () => {
  bs.init({
    server: {
      baseDir: './dist'
    }
  });

  // Html and metal smith is run simultaneously, causing it to break so till that is figured out, have to manually run metalsmith
  // gulp.watch('./src/_data/**/*.md', gulp.series('metalsmith'));
  // gulp.watch('./src/partials/layouts/documentation.hbs', gulp.series('metalsmith'));
  // gulp.watch('./src/partials/layouts/modSidebar.hbs', gulp.series('metalsmith'));

  gulp.watch('./src/partials/layouts/courseOverview.hbs', gulp.series('compileCourseOverview'));
  gulp.watch('./src/**/*.hbs', gulp.series('html'));
  gulp.watch('./src/**/*.html', gulp.series('html'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
  livereload.listen();
  gulp.watch('**/*.html').on('change', reload);
});
