#!/usr/bin/env node
const program = require('commander');
const argv = process.argv;
const Wikilope = require('./lib/wikilope.js');

program
    .arguments('<cmd> [env]')
    .option('-a, --article <article>', "Wikipedia article name")
    .option('-c, --count <count>', "Number of links to fetch", parseInt)
    .option('-f, --format <format>', "Output format: 'tree' (default) or 'terms'")
    .option('--json', "Output in JSON format")
    .option('-l, --language <language>', "Language code for Wikipedia edition (e.g. 'en', 'nl', 'fr')")
    .option('--no-redirects', "Don't follow redirects")
    .option('--no-cache', "Don't cache entries")
    .option('-r, --recursive', "Also crawl up from results")
    .option('-s, --steps <steps>', "How many steps should we go up?", parseInt)
    .option('-v, --verbose')
    .parse(argv);

if (argv.length === 2) {
    program.outputHelp();
} else if (!program.language || !program.article) {
    console.error('Please specify language and article');
    process.exit(22);
} else {
    const opts = {
        article : program.article,
        count : program.count,
        debug : program.verbose,
        followRedirects : program.redirects,
        format : program.format,
        json : program.json,
        language : program.language,
        recursive : program.recursive,
        steps : program.steps,
        useCache : program.cache
    };

    if (program.verbose) {
        console.log('Creating new Wikilope with these options', opts);
    }

    const lope = new Wikilope(opts);
    lope.run();
}