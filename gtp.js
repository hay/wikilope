const Configstore = require('configstore');
const jsdom = require('jsdom');
const fetch = require("node-fetch");
const pkg = require('./package.json');

const DEFAULT_ROOT_ARTICLES = ['Language', 'Science', 'Philosophy', 'Physics'];

class GTP {
    constructor({
        article, debug, language, followRedirects = true,
        rootArticles = DEFAULT_ROOT_ARTICLES, stopAtRoot = false,
        stopAtPhilosophy = false, count = 1, useCache = false
    }) {
        this.article = article;
        this.count = count;
        this.debug = debug;
        this.followRedirects = followRedirects;
        this.language = language;
        this.path = [ this.getLinkObject(language, article, article) ];
        this.rootArticles = rootArticles;
        this.stopAtRoot = stopAtRoot;
        this.stopAtPhilosophy = stopAtPhilosophy;
        this.useCache = useCache;

        if (this.useCache) {
            this.linkCache = new Configstore(pkg.name);
        }

        this.log("Setting up the class");
    }

    async getDom(url) {
        this.log(`Loading < ${url} >`);

        const req = await fetch(url);

        if (req.status !== 200) {
            console.error(`Could not fetch article, error ${req.status} ${req.statusText}`);
        }

        const body = await req.text();
        const dom = new jsdom.JSDOM(body);

        return dom.window.document;
    }

    async getFirstLinkForPage(href, count = 1) {
        if (this.useCache && this.linkCache.has(href) && count === 1) {
            this.log(`Hitting cache for < ${href} >`);
            return [ this.linkCache.get(href) ];
        }

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
        const candidates = Array.from(doc.querySelectorAll('[data-mw-section-id] p [rel="mw:WikiLink"]'));
        const links = [];

        for (let link of candidates) {
            const title = link.title;

            this.log(`Considering ${title}`);

            if (this.isArticle(link)) {
                const href = link.href.slice(2);
                const linkObject = this.getLinkObject(link.title, href);
                this.log(`Okay, this is a valid link: ${linkObject}`);
                links.push(linkObject);

                if (this.useCache) {
                    this.linkCache.set(href, linkObject);
                }
            }

            if (links.length === count) {
                this.log(`We're done, returning ${links.length} links (count ${count})`);
                return links;
            }
        }

        return [null];
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


    async getTreeFor(href) {
        while (true) {
            let link = await this.getFirstLinkForPage(href);

            if (link.length) {
                link = link[0];

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
                    href = link.href;
                    this.path.push(link);
                }
            } else {
                console.log('NO LINK!');
                break;
            }
        }
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
        console.log(`Getting links for ${page}`);

        const starters = await this.getFirstLinkForPage(page, this.count);

        starters.forEach(async (starter, index) => {
            if (!starter) {
                console.log(`No links for ${page}, aborting`);
                return;
            }

            console.log(`\nGetting tree for link #${index + 1}: < ${starter.title} >`);
            await this.getTreeFor(starter.href);
        });
    }
}

module.exports = GTP;