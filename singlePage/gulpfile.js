var gulp = require('gulp');
var rename = require('gulp-rename');
var less = require('gulp-less');
var ejs = require('gulp-ejs');
var data = require('gulp-data');
var cleanCSS = require('gulp-clean-css');
var clean = require('gulp-clean');
var webserver = require('gulp-webserver');
var plumber = require('gulp-plumber');

var path = require('path');
var fs = require('fs');

var srcPath = {
    less: 'src/less/*.less',
    allless: ['src/less/**/*.less', 'src/less/*.less'],
    ejs: 'src/*.ejs',
    json: 'src/temple/*.json',
    staticSource: ['src/css/*.css', 'src/fonts/*', 'src/images/*', 'src/js/*.js']
};

var buildPath = {
    root: 'dist',
    css: 'dist/css',
    html: 'dist',
};

// 标志是否 clean
var IsClean = false;


// 默认执行的任务
gulp.task('default', ['webserver'], function() {
    console.log('default task ok!');
})

// 本地服务器 + 热更新
gulp.task('webserver', ['copy', 'less', 'ejs', 'watch'], function() {
    gulp.src('dist')    // 监控的目录
        .pipe(webserver({
            port: 5000,         // 设置端口
            livereload: true,   // 监听文件变化，热更新
            open: true          // 运行任务时，自动打开浏览器
        }))
})

// less 处理
gulp.task('less', ['clean'], function() {
    return gulp.src(srcPath.less)
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest(buildPath.css))
        .pipe(cleanCSS())
        .pipe(rename(function(path){
            path.basename += '.min.';
        }))
        .pipe(gulp.dest(buildPath.css))
});

// getJsonData
var getJsonData = function(file) {
    // G:\workspace\glup-test\src\index.ejs
    // => src/temple/index.json
    var jsonFile = 'src/temple/' + path.basename(file.path, '.ejs') + '.json';
    var data = JSON.parse(fs.readFileSync(jsonFile));
    return data;
}
// ejs 处理
gulp.task('ejs', ['clean'], function() {
    return gulp.src(srcPath.ejs)
        .pipe(plumber())
        .pipe(data(getJsonData))
        .pipe(ejs({},{},{ext: '.html'}))
        .pipe(gulp.dest(buildPath.html))
});

// copy 任务处理
gulp.task('copy', ['clean'], function() {
    gulp.src(srcPath.staticSource)
        .pipe(gulp.dest(function(file) {
            var toPath = buildPath.root + '/' + path.basename(file.base);
            // console.log(toPath)
            return toPath;
        }))
})

// clean 任务处理
gulp.task('clean', function() {
    if (!IsClean) {
        IsClean = true;
        return gulp.src(buildPath.root)
            .pipe(plumber())
            .pipe(clean({force: true}))
    }
    return;
})

// 监听任务
gulp.task('watch', function() {
    console.log('watch...')

    gulp.watch(srcPath.allless, ['less']); // 监听所有的 less 文件
    gulp.watch(srcPath.ejs, ['ejs']);     // 监听 ejs 文件
    gulp.watch(srcPath.json, ['ejs']);    // 监听 json 文件
    gulp.watch(srcPath.staticSource, ['copy'])
})
