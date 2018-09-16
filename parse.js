// The difference between
//
// <p>Something (in brackets)</p>
//
// And
//
// <p>Something <a href="#">in (brackets)</a></p>

const fs = require('fs');
const text = fs.readFileSync('brackets.html', 'utf-8');

let IN_TAG = false;
let TAG_OPEN = false;
let TAG;
let TAG_NAME;
let BRACKET = false;
let html = '';

for (let char of text) {
    if (char === '<' && !TAG_OPEN) {
        IN_TAG = true;
        TAG_OPEN = true;
        TAG = '';
    } else if (char === '>' && TAG_OPEN) {
        TAG_OPEN = false;

        if (TAG[0] === '/') {
            IN_TAG = false;
            console.log(`CLOSE ${TAG.slice(1)}`);
        } else {
            TAG_NAME = TAG.split(' ')[0];
            console.log(TAG_NAME);
        }
    } else if (TAG_OPEN) {
        TAG += char;
    }

    if (char === '(') {
        BRACKET = true;
    }

    if (!BRACKET || (BRACKET && TAG_NAME !== 'p')) {
        html += char;
    }

    if (char === ')') {
        BRACKET = false;
    }
}

console.log(html);