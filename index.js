#!/usr/bin/env node
const program = require('commander');
const argv = process.argv;
const { climbUp } = require('./gtp.js');

program
    .arguments('<cmd> [env]')
    .option('-l, --language <language>', "Language code for Wikipedia edition (e.g. 'en', 'nl', 'fr')")
    .option('-a, --article <article>', "Wikipedia article name")
    .parse(argv);

if (argv.length === 2) {
    program.outputHelp();
} else if (!program.language || !program.article) {
    console.error('Please specify language and article');
    process.exit(1);
} else {
    climbUp({
        article : program.article,
        language : program.language
    });
}