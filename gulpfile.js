const gulp = require('gulp');
const handlebars = require('gulp-compile-handlebars');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const livereload = require('gulp-livereload');
const bs = require('browser-sync').create();
const reload = bs.reload;

const courseData = require('./dist/data/courses.json');
const courses = courseData['courses'];

sass.compiler = require('node-sass');

gulp.task('compileCourses', (done) => {  
  for(var i=0; i<courses.length; i++){
    let course = courses[i],
        fileName = course.slug;
    console.log('Going through: ' + fileName);

    gulp.src('./src/partials/layouts/courses.hbs')
      .pipe(handlebars(course, {
        batch: ['./src/partials']
      }))
      .pipe(rename(fileName + '.html'))
      .pipe(gulp.dest('dist/courses'));
  }
  done();
});

gulp.task('html', () => {
  return gulp.src('./src/pages/*.html')
    .pipe(handlebars({}, {
      ignorePartials: true,
      batch: ['./src/partials']
    }))
    .pipe(rename({dirname: ''}))
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

  gulp.watch('./src/partials/layouts/courses.hbs', gulp.series('compileCourses'));
  gulp.watch('./src/**/*.hbs', gulp.series('html'));
  gulp.watch('./src/**/*.html', gulp.series('html'));
  gulp.watch('./src/scss/**/*.scss', gulp.series('sass'));
  livereload.listen();
  gulp.watch('**/*.html').on('change', reload);
});
