var express = require('express');
var router = express.Router();
var { JSDOM } = require('jsdom');

// Function to extract CSS and HTML from a URL
async function getCSS(url) {
  try {
    // Dynamically import node-fetch (v3 is an ES module)
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default;

    // Fetch the main HTML page and record the status code
    const response = await fetch(url);
    const mainStatus = response.status;
    const html = await response.text();

    // Parse HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract inline CSS from <style> tags
    const inlineStyles = Array.from(document.querySelectorAll('style')).map(
      style => style.textContent
    );

    // Extract external CSS URLs from <link rel="stylesheet"> tags
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(
      link => new URL(link.getAttribute('href'), url).href
    );

    // Fetch external CSS files along with their HTTP status codes
    const externalCSS = await Promise.all(
      cssLinks.map(async (cssUrl) => {
        const cssResponse = await fetch(cssUrl);
        const cssText = await cssResponse.text();
        return {
          url: cssUrl,
          httpStatus: cssResponse.status,
          content: cssText
        };
      })
    );

    return {
      http: { mainPageStatus: mainStatus },
      html: html,
      inline: inlineStyles,
      external: externalCSS
    };
  } catch (error) {
    console.error("Error extracting CSS:", error);
    throw error;
  }
}

// Uncomment below to use as an Express route handler
// router.get('/', async function(req, res, next) {
//   const url = req.query.url;
//   if (!url) {
//     return res.status(400).json({ error: 'Missing url query parameter' });
//   }
  
//   try {
//     const data = await getCSS(url);
//     res.json(data);
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = getCSS;
