const jsdom = require('jsdom');
const fetch = require("node-fetch");

class GTP {
    constructor({ language, article }) {
        this.article = article;
        this.language = language;
        this.path = [ this.getLinkObject(language, article, article) ];
    }

    async getDom(url) {
        const req = await fetch(url);
        const body = await req.text();
        const dom = new jsdom.JSDOM(body);
        return dom.window.document;
    }

    async getFirstLinkForPage(href) {
        const URL = `https://${this.language}.wikipedia.org/api/rest_v1/page/html/${href}`;
        const doc = await this.getDom(URL);
        const links = Array.from(doc.querySelectorAll('[data-mw-section-id="0"] p [rel="mw:WikiLink"]'));

        for (let link of links) {
            const title = link.title;
            // console.log(`Considering ${title}`);

            if (this.isArticle(title)) {
                const href = link.href.slice(2);

                return this.getLinkObject(link.title, href);
            }
        }

        return null;
    }

    getLinkObject(title, href) {
        return {
            href : href,
            url : `https://${this.language}.wikipedia.org/wiki/${href}`,
            title : title,
        }
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

    isArticle(title) {
        if (title.indexOf('Help:IPA') !== -1) return false;
        if (title.includes(':')) return false;
        return true;
    }

    push(link) {
        this.path.push(link);
    }

    async run() {
        let page = this.article;

        while (true) {
            const link = await this.getFirstLinkForPage(page);

            if (link) {
                if (this.hasLink(link)) {
                    console.log(`We're going in circles ${link.title}, aborting.`);
                    break;
                } else {
                    console.log(link.title);
                    page = link.href;
                    this.path.push(link);
                }
            } else {
                console.log('NO LINK!');
                break;
            }
        }
    }
}

module.exports = GTP;