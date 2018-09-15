#!/usr/bin/env node
const program = require('commander');
const argv = process.argv;
const GTP = require('./gtp.js');

program
    .arguments('<cmd> [env]')
    .option('-a, --article <article>', "Wikipedia article name")
    .option('-l, --language <language>', "Language code for Wikipedia edition (e.g. 'en', 'nl', 'fr')")
    .option('--no-redirects', "Don't follow redirects")
    .option('-s, --stop-at-root')
    .option('-P, --stop-at-philosophy')
    .option('-v, --verbose')
    .parse(argv);

if (argv.length === 2) {
    program.outputHelp();
} else if (!program.language || !program.article) {
    console.error('Please specify language and article');
    process.exit(1);
} else {
    const gtp = new GTP({
        article : program.article,
        debug : program.verbose,
        followRedirects : program.redirects,
        language : program.language,
        stopAtRoot : program.stopAtRoot,
        stopAtPhilosophy : program.Philosophy
    });

    gtp.run();
}