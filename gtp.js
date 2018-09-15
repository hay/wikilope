const jsdom = require('jsdom');
const fetch = require("node-fetch");

class Path {
    constructor(lang, page) {
        this.path = [{
            href : page,
            lang : lang,
            page : page,
            url : `https://${lang}.wikipedia.org/wiki/${page}`,
            title : page
        }];
    }

    getPath() {
        return this.path;
    }

    hasLink(link) {
        for (const path of this.path) {
            if (path.href === link.href) {
                return true;
            }
        }

        return false;
    }

    push(link) {
        this.path.push(link);
    }
}

function isArticle(title) {
    if (title.indexOf('Help:IPA') !== -1) return false;
    if (title.includes(':')) return false;
    return true;
}

async function getDom(url) {
    const req = await fetch(url);
    const body = await req.text();
    const dom = new jsdom.JSDOM(body);
    return dom.window.document;
}

async function getFirstLinkForPage(lang, page) {
    const URL = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${page}`;
    const doc = await getDom(URL);
    const links = Array.from(doc.querySelectorAll('[data-mw-section-id="0"] p [rel="mw:WikiLink"]'));

    for (let link of links) {
        const title = link.title;
        console.log(`Considering ${title}`);

        if (isArticle(title)) {
            const href = link.href.slice(2);

            return {
                href : href,
                lang : lang,
                page : page,
                url : `https://${lang}.wikipedia.org/wiki/${href}`,
                title : link.title,
            }
        }
    }

    return null;
}

async function climbUp({ language, article }) {
    const path = new Path(language, article);

    console.log(article);

    while (true) {
        const link = await getFirstLinkForPage(language, article);

        if (link) {
            if (path.hasLink(link)) {
                console.log(`We're going in circles ${link.title}, aborting.`);
                break;
            } else {
                console.log(link.title);
                page = link.href;
                path.push(link);
            }
        } else {
            console.log('NO LINK!');
            break;
        }
    }
}

module.exports = { climbUp, getFirstLinkForPage };