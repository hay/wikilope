# wikilope
> Discover interesting connections starting from a Wikipedia article.

This is a Node.js library and command-line tool to see connections from Wikipedia articles. For example, you can use it to see the [Getting to Philosophy](https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy) effect, but it can do much more.

## Install
```
$ npm install -g wikilope
```

## Basic usage

On the command line

```bash
wikilope -l <language code> -a <article name>
```

Or using a script

```javascript
const Wikilope = require('../index.js');

const lope = new Wikilope({
    article : '<article name>',
    language : '<language>'
});

lope.run();
```

## Advanced usage
### Command line
The `wikilope` command has a lot of options you can use for interesting queries:

```bash
Usage: wikilope [options] <cmd> [env]

Options:

  -a, --article <article>    Wikipedia article name
  -c, --count <count>        Number of links to fetch
  -f, --format <format>      Output format: 'tree' (default) or 'terms'
  --json                     Output in JSON format
  -l, --language <language>  Language code for Wikipedia edition (e.g. 'en', 'nl', 'fr')
  --no-redirects             Don't follow redirects
  --no-cache                 Don't cache entries
  -r, --recursive            Also crawl up from results
  -s, --steps <steps>        How many steps should we go up?
  -v, --verbose
  -h, --help                 output usage information
```

Here's the classical [Getting to Philosopy](https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy) effect, starting from the English language Wikipedia version of the 'Amsterdam' article.

    wikilope -l en -a Amsterdam

Let's not just get the first link, but the first three links. And let's use the German Wikipedia.

    wikilope -l de -a Amsterdam -c 3

To also get the links from the articles you find use the recursive (`-r`) option.

    wikilope -l en -a Elephant -r

Get the same data, but in JSON format

    wikilope -l en -a Elephant -r --json

To limit the number of articles we're getting we could use the step (`-s`) option. We're also getting the first three links and doing it recursive.

    wikilope -l en -a Blockchain -rs 5 -c 3

### Node.js
Use this module for Node.js like this:

```javascript
const Wikilope = require('../index.js');

const lope = new Wikilope({
    article : 'Amsterdam',
    language : 'en'
});

lope.run();
```

All options of the command line version have equivalent arguments in the `Wikilope` constructor:

```javascript
{
 // Class option      : Command line flag
    article           : article,
    count             : count,
    debug             : verbose,
    followRedirects   : redirects,
    format            : format,
    json              : json,
    language          : language,
    recursive         : recursive,
    steps             : steps,
    useCache          : cache
}
```

## License
MIT &copy; [Hay Kranen](http://www.haykranen.nl)