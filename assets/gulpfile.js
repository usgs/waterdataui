const gulp = require('gulp');
const RevAll = require('gulp-rev-all');


gulp.task('revall', function () {
    return gulp.src('dist/**')
        .pipe(RevAll.revision({
            dontGlobal: [
                /favicon.ico$/,
                /rev-manifest.json$/,
                /.+\.[a-f0-9]{8}\..+$/  // skip already hashed files
            ]
        }))
        .pipe(gulp.dest('dist'))
        .pipe(RevAll.manifestFile({fileName: 'manifest.json'}))
        .pipe(gulp.dest('dist'));
});
