const gulp = require('gulp');
const RevAll = require('gulp-rev-all');


gulp.task('revall', function () {
    return gulp.src('dist/**')
        .pipe(RevAll.revision({
            dontGlobal: [
                /rev-manifest.json$/,
                /.+\.[a-f0-9]{8}\..+$/  // skip already hashed files
            ],
            includeFilesInManifest: ['.css', '.js', '.ico', '.svg', '.png']
        }))
        .pipe(gulp.dest('dist'))
        .pipe(RevAll.manifestFile({fileName: 'manifest.json'}))
        .pipe(gulp.dest('dist'));
});
