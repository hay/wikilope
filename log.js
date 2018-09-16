const chalk = require('chalk');

const LEVEL_DEBUG = 0;
const LEVEL_INFO = 1;
const LEVEL_ERROR = 2;

let level = LEVEL_INFO;

function debug(msg) {
    if (level <= LEVEL_DEBUG) {
        console.log(chalk.green(msg));
    }
}

function info(msg) {
    if (level <= LEVEL_INFO) {
        console.log(chalk.blue(msg));
    }
}

function error(msg) {
    if (level <= LEVEL_ERROR) {
        console.log(chalk.red(msg));
    }
}

function setLevel(newLevel) {
    level = newLevel;
}

module.exports = {
    LEVEL_DEBUG,
    LEVEL_ERROR,
    LEVEL_INFO,
    debug,
    error,
    info,
    setLevel
}