const gulp  = require('gulp'),
    browserSync = require('browser-sync'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    file = require('gulp-file'),
    inject = require('gulp-inject'),
    rev = require('gulp-rev'),
    fs = require('fs'),
    clean = require('gulp-clean'),
    currentDateTime = new Date().toLocaleString();

const folder = {
    src: 'src/',
    dest: 'dist/'
};

function html() {
    return gulp.src(folder.src + 'html/**/*')
        .pipe(gulp.dest(folder.dest))
}

function style() {
    return gulp.src(folder.src + 'less/style.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(folder.dest + 'css/'))
        .pipe(rev())
        .pipe(gulp.dest(folder.dest + 'css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(folder.dest + 'css/'))
}

function images() {
    return gulp.src(folder.src + 'images/**/*.{jpg,jpeg,png,gif,svg,iso}')
        .pipe(imagemin())
        .pipe(gulp.dest(folder.dest + 'images'))
}

function scripts() {
    return gulp.src(folder.src + 'js/*')
        .pipe(uglify())
        .pipe(gulp.dest(folder.dest + 'js/'))
        .pipe(rev())
        .pipe(gulp.dest(folder.dest + 'js/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(folder.dest + 'js/'))
}

function injectStyle() {
    var jsonCss = JSON.parse(fs.readFileSync(folder.dest + 'css/rev-manifest.json'));
    var jsonJs = JSON.parse(fs.readFileSync(folder.dest + 'js/rev-manifest.json'));

    var target = gulp.src(folder.dest + '*.html');
    var source = gulp.src(['./css/' + jsonCss['style.css'], './js/' + jsonJs['main.js']], { read: false, cwd: __dirname + '/dist' });

    return target
        .pipe(inject(source, { addRootSlash: false }))
        .pipe(gulp.dest(folder.dest));
}

function appVersion() {
    var packageSource = require('./package.json');

    return gulp.src(folder.src)
        .pipe(file(
            'version.txt', 'App version: '+ packageSource.version + ', Generated: ' + currentDateTime))
        .pipe(gulp.dest(folder.dest));
}

function watchFiles() {
    browserSync.init({
        server: {
            baseDir: folder.dest
        }
    });

    gulp.watch(folder.src + 'html/**', html);
    gulp.watch(folder.src + 'js/*', scripts);
    gulp.watch(folder.src + 'less/*.less', style);
    gulp.watch(folder.src + 'images/**', images);
    gulp.watch(folder.src).on('change', browserSync.reload);
}

function cleaning() {
    return gulp.src([folder.dest + 'css/style.css', folder.dest + 'css/rev-manifest.json', folder.dest + 'js/main.js', folder.dest + 'js/rev-manifest.json'])
        .pipe(clean());
}

exports.images = images;
exports.html = html;
exports.style = style;
exports.scripts = scripts;
exports.appVersion = appVersion;
exports.watchFiles = watchFiles;
exports.build  = gulp.series(html, style, images, scripts, injectStyle, appVersion, cleaning, watchFiles);
exports.default = gulp.series(html, style, images, scripts, watchFiles);
