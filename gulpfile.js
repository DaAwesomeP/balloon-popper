/* gulpfile.js
 * Originally created 10/11/2018 by Perry Naseck (DaAwesomeP)
 * https://github.com/DaAwesomeP/balloon-popper
 *
 * Copyright 2018-present Perry Naseck (DaAwesomeP)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const gulp = require('gulp')
const del = require('del')
const lec = require('gulp-line-ending-corrector')
const bro = require('gulp-bro')
const babelify = require('babelify')
const eslint = require('gulp-eslint')
const sourcemaps = require('gulp-sourcemaps')

gulp.task('check', () => {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('checkSafe', () => {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('static', () => {
  return gulp.src('src/**/*.js')
    .pipe(lec())
    .pipe(gulp.dest('src'))
})

gulp.task('clean', (callback) => {
  del(['dist/*']).then(() => {
    callback()
  })
})

gulp.task('compile', gulp.parallel(() => {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(bro({
      transform: [
        babelify.configure()
      ]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
}, () => {
  return gulp.src(['src/**/*', '!src/**/*.js'])
    .pipe(gulp.dest('dist'))
}, () => gulp.src(['node_modules/bootstrap/dist/css/**/*']).pipe(gulp.dest('dist/node_modules/css/bootstrap'))
, () => gulp.src(['node_modules/jquery/dist/**/*']).pipe(gulp.dest('dist/node_modules/js/jquery'))
, () => gulp.src(['node_modules/bootstrap/dist/js/**/*']).pipe(gulp.dest('dist/node_modules/js/bootstrap'))
, () => gulp.src(['node_modules/three/**/*']).pipe(gulp.dest('dist/node_modules/js/three'))
))

gulp.task('watch', gulp.series('checkSafe', 'compile', () => {
  return gulp.watch(['src/**/*', 'package.json'], gulp.parallel('checkSafe', 'compile'))
}))

gulp.task('dist', gulp.series('static', 'check', 'clean', 'compile'))
gulp.task('build', gulp.series('dist'))
gulp.task('default', gulp.series('build'))
