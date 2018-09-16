const log = require('./log.js');
const Configstore = require('configstore');
const pkg = require('./package.json');
const { getDomForArticle, getSummaryForArticle } = require('./api.js');

const DEFAULT_ROOT_ARTICLES = ['Language', 'Science', 'Philosophy', 'Physics'];

class GTP {
    constructor({
        article, debug, language, followRedirects = true,
        rootArticles = DEFAULT_ROOT_ARTICLES, stopAtRoot = false,
        stopAtPhilosophy = false, count = 1, useCache = false
    }) {
        if (debug) {
            log.setLevel(log.LEVEL_DEBUG);
        }

        this.article = article;
        this.count = count;
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

        log.debug("Setting up the class");
    }

    async getFirstLinkForPage(href, count = 1) {
        if (this.useCache && this.linkCache.has(href) && count === 1) {
            log.debug(`Hitting cache for < ${href} >`);
            return [ this.linkCache.get(href) ];
        }

        const doc = await getDomForArticle(this.language, href);

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

            log.debug(`Considering ${title}`);

            if (this.isArticle(link)) {
                const href = link.href.slice(2);
                const linkObject = this.getLinkObject(link.title, href);
                log.debug(`Okay, this is a valid link: ${linkObject}`);
                links.push(linkObject);

                if (this.useCache) {
                    this.linkCache.set(href, linkObject);
                }
            }

            if (links.length === count) {
                log.debug(`We're done, returning ${links.length} links (count ${count})`);
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
                    log.info(`${link.title} - We've seen that article before, aborting.`);
                    break;
                } else if (this.stopAtRoot && this.rootArticles.includes(link.title)) {
                    log.info(`${link.title} - Root article, stopping here`);
                    break;
                } else if (this.stopAtPhilosophy && link.title === 'Philosophy') {
                    log.info("Philosophy, we're there. Stopping");
                    break;
                } else {
                    log.info(link.title);
                    href = link.href;
                    this.path.push(link);
                }
            } else {
                log.info('NO LINK!');
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

    push(link) {
        this.path.push(link);
    }

    async run() {
        let page = this.article;
        log.info(`Getting links for ${page}`);

        const starters = await this.getFirstLinkForPage(page, this.count);

        starters.forEach(async (starter, index) => {
            if (!starter) {
                log.info(`No links for ${page}, aborting`);
                return;
            }

            log.info(`\nGetting tree for link #${index + 1}: < ${starter.title} >`);
            await this.getTreeFor(starter.href);
        });
    }
}

module.exports = GTP;