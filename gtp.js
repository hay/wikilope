const jsdom = require('jsdom');
const fetch = require("node-fetch");

const DEFAULT_ROOT_ARTICLES = ['Language', 'Science', 'Philosophy', 'Physics'];

class GTP {
    constructor({
        article, debug, language, followRedirects = true,
        rootArticles = DEFAULT_ROOT_ARTICLES, stopAtRoot = false,
        stopAtPhilosophy = false
    }) {
        this.article = article;
        this.debug = debug;
        this.followRedirects = followRedirects;
        this.language = language;
        this.path = [ this.getLinkObject(language, article, article) ];
        this.rootArticles = rootArticles;
        this.stopAtRoot = stopAtRoot;
        this.stopAtPhilosophy = stopAtPhilosophy;
        this.log("Setting up the class");
    }

    async getDom(url) {
        this.log(`Loading < ${url} >`);

        const req = await fetch(url);
        const body = await req.text();
        const dom = new jsdom.JSDOM(body);

        return dom.window.document;
    }

    async getFirstLinkForPage(href) {
        const URL = `https://${this.language}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(href)}`;
        const doc = await this.getDom(URL);

        // Remove stuff between brackets
        // This breaks when using things like Gemeente (bestuur)
        /*
        Array.from(doc.querySelectorAll('[data-mw-section-id] p')).forEach((p) => {
            p.innerHTML = p.innerHTML.replace(/\([^\)]*\)/, '');
        });
        */

        // And now get all the links
        const links = Array.from(doc.querySelectorAll('[data-mw-section-id] p [rel="mw:WikiLink"]'));

        for (let link of links) {
            const title = link.title;

            this.log(`Considering ${title}`);

            if (this.isArticle(link)) {
                const href = link.href.slice(2);
                return this.getLinkObject(link.title, href);
            }
        }

        return null;
    }

    getLinkObject(title, href) {
        return {
            href : href,
            url : `https://${this.language}.wikipedia.org/wiki/${encodeURIComponent(href)}`,
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

    isArticle(link) {
        if (link.title.indexOf('Help:IPA') !== -1) return false;
        if (link.title.includes(':')) return false;

        if (!this.followRedirects) {
            if (link.className === 'mw-redirect') return false;
        }

        return true;
    }

    log() {
        if (this.debug) {
            console.log.apply(this, arguments);
        }
    }

    push(link) {
        this.path.push(link);
    }

    async run() {
        let page = this.article;
        console.log(page);

        while (true) {
            const link = await this.getFirstLinkForPage(page);

            if (link) {
                if (this.hasLink(link)) {
                    console.log(`${link.title} - We've seen that article before, aborting.`);
                    break;
                } else if (this.stopAtRoot && this.rootArticles.includes(link.title)) {
                    console.log(`${link.title} - Root article, stopping here`);
                    break;
                } else if (this.stopAtPhilosophy && link.title === 'Philosophy') {
                    console.log("Philosophy, we're there. Stopping");
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