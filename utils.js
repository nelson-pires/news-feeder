'use strict';

//LAST UPDATE: 2023.01.15

module.exports = {

    startsWithHttp: (str) => {
        return (str.startsWith('https://') || str.startsWith('http://')) ? true : false;
    },

    // no milliseconds as feed dont have it (supports value padding)
    simpleDateTime: (date) => {
        const year = date.getFullYear();
        const month = String('00' + (date.getMonth() + 1)).slice(-2);
        const day = String('00' + date.getDate()).slice(-2);
        const hour = String('00' + date.getHours()).slice(-2);
        const min = String('00' + date.getMinutes()).slice(-2);
        const sec = String('00' + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    },

    // not in use
    sqlDate: (date) => {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    },

    // could also use con.escape(data)
    sqlSafe: (data) => {
        return data.replaceAll("'", "''");
    },

    // wraps data in an element of choice (defaults to <p>)
    wrapElm: (data, elm) => {
        if (elm == null || elm === 'undefined') elm = 'p'; // could've used an overload here instead
        return `<${elm}>${data}</${elm}>`;
    },

    extraNav: () => {
        return `
        <p>&gt; <a href="/api/list/imports">api/list/imports</a></p>
        <p>&gt; <a href="/api/truncate/imports">api/truncate/imports</a></p>
        <p>&gt; <a href="/api/truncate/articles">api/truncate/articles</a></p>`;
    },

    // this builds each data card (for visualisation purposes)
    dataCard: (id, externalId, title, description, mainPicture) => {
        return `
        <section style="display:flex;align-items:center;border:1px solid #dcb;margin:8px 0 16px 0;padding:8px;font-family:monospace,system-ui,-apple-system,sans-serif">
            <div style="max-width:300px;max-height:150px">
                <img src="${mainPicture}" width="300" />
            </div>
            <div style="margin-left:16px;overflow:auto">
                <div style="margin-bottom:12px">(${id}) <a href="${externalId}" target="_blank">${externalId}</a></div>
                <div style="margin-bottom:12px;font-weight:bold">${title}</div>
                <div>${description}</div>
            </div>
        </section>`;
    },

    // builds and returns a valid html5 document
    htmlDoc: (main) => {
        let doc = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>News feeder API</title>
    <meta name="robots" content="none">
    <style>
        *, *::before, *::after { box-sizing:border-box }
        body { margin:20px; font-family:monospace,system-ui,sans-serif }
        header { display:flex; justify-content:space-around; margin-bottom:12px; padding:15px; background-color:#eaecee }
        header > a { display:inline-block; padding:6px 12px; background-color:#d2d4d6 }
        b { color:#d21 }
    </style>
</head>
<body>
    <h1>News feeder API</h1>
    <header>
        <a href="/api">api</a>
        <a href="/api/articles">api/articles</a>
        <a href="/api/articles/import?siteRssUrl=https://www.lemonde.fr/rss/une.xml">api/articles/import?siteRssUrl=https://www.lemonde.fr/rss/une.xml</a>
    </header>
    <main>
        ${main}
    </main>
</body>
</html>`;
        return doc;
    }
};