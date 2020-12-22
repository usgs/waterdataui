const gulp = require('gulp');
const RevAll = require('gulp-rev-all');


gulp.task('revall', function() {
    return gulp.src('dist/**')
        .pipe(RevAll.revision({
            dontGlobal: [
                /rev-manifest.json$/,

                // Skip already hashed files
                /.+\.[a-f0-9]{8}\..+$/,

                // Skip leaflet markers that are referenced via Javascript
                /marker-icon.png$/,
                /marker-icon-2x.png$/,
                /marker-shadow.png$/,
                //Skip USWDS svg
                /.*svg$/
            ],
            includeFilesInManifest: ['.css', '.js', '.ico', '.png', '.webmanifest', '.xml']
        }))
        .pipe(gulp.dest('dist'))
        .pipe(RevAll.manifestFile({fileName: 'manifest.json'}))
        .pipe(gulp.dest('dist'));
});
