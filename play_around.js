import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

async function getCSS(url) {
    const res = await fetch(url);
    const html = await res.text()

    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const inlineStyles = Array.from(document.querySelectorAll('style')).map(style => style.textContent);

    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => new URL(link.getAttribute('href'), url).href);

    const externalCSS = await Promise.all(
        cssLinks.map(async (cssUrl) => {
            const res = await fetch(cssUrl);
            return res.text();
        })
    );
    return{inline: inlineStyles, external: externalCSS}
}

getCSS('https://www.apple.com/').then(css => console.log(css)).catch(err => console.error('Error fetching CSS:', err))
