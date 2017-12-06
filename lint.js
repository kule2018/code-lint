'use strict';

/* eslint-disable no-console */

const gulp = require('gulp');
const path = require('path');
const eslint = require('gulp-eslint');
const fs = require('fs');

// 运行检测命令的目录
const initCWD = process.env.INIT_CWD;
const cwd = process.cwd();

const lintConfigFiles = ['.eslintrc.js', '.eslintignore'];

// 拷贝检测配置文件
if (cwd !== initCWD) {
    lintConfigFiles.map((val) => {
        fs.createReadStream(val).pipe(fs.createWriteStream(path.join(initCWD, val)));
    });
}

// 项目代码检测配置
const lintConfig = require(initCWD + '/lint.config.json');

let argv = require('yargs')
    .alias('p', 'projects')
    .argv;

let lintFiles = {
    js: [],
    vue: [],
};

let projects = argv.p + '';

const tasks = projects.replace(/\s/gi, '').split(',');

for (let obj in lintConfig) {
    if (lintConfig.hasOwnProperty(obj) && (tasks.indexOf(obj) !== -1 || !argv.p)) {
        lintConfig[obj].map(function (val) {
            let fileType = val.substr(val.lastIndexOf('.') + 1);
            let filesPath = path.join(initCWD, val);
            if (filesPath.indexOf('!') !== -1) {
                filesPath = '!' + filesPath.replace('!', '');
            }
            lintFiles[fileType] && lintFiles[fileType].push(filesPath);
        });
    }
}

// js 代码规范检测
gulp.task('eslint', function () {
    return gulp.src(lintFiles.js.concat(lintFiles.vue))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});


// lint task
gulp.task('lint', ['eslint'], function () {
    if (cwd !== initCWD) {
        // 移除检测配置文件
        lintConfigFiles.map((val) => {
            fs.unlinkSync(path.join(initCWD, val));
        });
    }
});