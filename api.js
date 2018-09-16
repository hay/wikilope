const log = require('./log.js');
const jsdom = require('jsdom');
const fetch = require("node-fetch");

async function getRequest(url) {
    log.debug(`Loading < ${url} >`);
    const req = await fetch(url);

    if (req.status !== 200) {
        log.error(`Could not fetch article, error ${req.status} ${req.statusText}`);
    }

    return req;
}

async function getDomForArticle(language, href) {
    const url = getEndpoint('html', language, href);
    const req = await getRequest(url);
    const body = await req.text();
    const dom = new jsdom.JSDOM(body);

    return dom.window.document;
}

function getEndpoint(method, language, href) {
    return `https://${language}.wikipedia.org/api/rest_v1/page/${method}/${encodeURIComponent(href)}`;
}

async function getSummaryForArticle(language, href) {
    const url = getEndpoint('summary', language, href);
    const req = await getRequest(url);

    return await req.json();
}

module.exports = { getDomForArticle, getSummaryForArticle };