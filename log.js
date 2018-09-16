const LEVEL_DEBUG = 0;
const LEVEL_INFO = 1;
const LEVEL_DANGER = 2;

let level = LEVEL_INFO;

function debug() {
    if (level <= LEVEL_DEBUG) {
        console.log.apply(this, arguments);
    }
}

function error() {
    if (level <= LEVEL_DANGER) {
        console.error.apply(this, arguments);
    }
}

function info() {
    if (level <= LEVEL_INFO) {
        console.log.apply(this, arguments);
    }
}

function setLevel(newLevel) {
    level = newLevel;
}

module.exports = {
    LEVEL_DEBUG,
    LEVEL_INFO,
    debug,
    error,
    info,
    setLevel
}