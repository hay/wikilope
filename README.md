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

# Examples

Do the classical [Getting to Philosopy](https://en.wikipedia.org/wiki/Wikipedia:Getting_to_Philosophy) effect, starting from the English language Wikipedia version of the 'Amsterdam' article.

    wikilope -l en -a Amsterdam

More examples can be found in the [examples](./examples) directory.

## License
MIT &copy; [Hay Kranen](http://www.haykranen.nl)