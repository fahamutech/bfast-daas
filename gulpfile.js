const process = require('child_process');
const pkg = require('./package');
const gulp = require('gulp');

function startDev(cb) {
    // const devProcess = process.exec(`npm start`, {
    //     env: {
    //         APPLICATION_ID: 'faas',
    //         // GIT_USERNAME: 'joshuamshana',
    //         // GIT_TOKEN: 'b4ec4eac383a46215cd8e7f9ea00a20b9996549a',
    //         PROJECT_ID: 'demofaas',
    //         GIT_CLONE_URL: 'https://github.com/joshuamshana/BFastFunctionExample.git'
    //     }
    // });

    // devProcess.on('exit', (code, signal) => {
    //     console.log('dev server stops');
    //     cb();
    // });
    //
    // devProcess.on('error', (err) => {
    //     console.error(err);
    //     cb();
    // });
    //
    // devProcess.stdout.on('data', (data) => {
    //     console.log(data);
    // });
    //
    // devProcess.stderr.on('data', (data) => {
    //     console.log(data);
    // });
}

function buildDockerImage(cb) {
    const buildImage = process.exec(`sudo docker build -t joshuamshana/bfast-ce-daas:v${pkg.version} .`);

    buildImage.on('exit', (code, signal) => {
        console.log('build image task exit');
        cb();
    });

    buildImage.on('error', (err) => {
        console.error(err);
        cb();
    });

    buildImage.stdout.on('data', (data) => {
        console.log(data);
    });

    buildImage.stderr.on('data', (data) => {
        console.log(data);
    });
}

function pushToDocker(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas:v${pkg.version}`);

    pushImage.on('exit', (code, signal) => {
        console.log('push image exit');
        cb();
    });

    pushImage.on('error', (err) => {
        console.error(err);
        cb();
    });

    pushImage.stdout.on('data', (data) => {
        console.log(data);
    });

    pushImage.stderr.on('data', (data) => {
        console.log(data);
    });
}

// exports.startDev = startDev;
exports.publishContainer = gulp.series(buildDockerImage, pushToDocker);