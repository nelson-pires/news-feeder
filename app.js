'use strict';

// LAST UPDATE: 2023.01.15

// http://localhost:3500/api

const express = require('express');
const app = express();
const port = process.env.PORT || 3500;
const Parser = require('rss-parser');
const utils = require('./utils');
const mysql = require('mysql');
const db = {
  host: '0.0.0.0',
  database: 'xxxxx',
  user: 'xxxxx',
  password: 'xxxxx'
}
// this is an api but we return html to better render the output
const returnType = 'text/html'; // application/json

app.disable('view cache');

app.use(express.urlencoded({
  extended: true
}));

app.get('/api', async (req, res) => {
  try {
    res.setHeader('Content-Type', returnType);
    res.send(utils.htmlDoc(utils.extraNav()));
  }
  catch (ex) {
    res.send(utils.htmlDoc(utils.wrapElm(`Exception:<br>${ex.message}`,'b')));
  }
});

app.get('/api/list/imports', async (req, res) => {
  res.setHeader('Content-Type', returnType);
  const con = mysql.createConnection(db);
  try {
    con.query('select * from imports', (err, rows) => {
      if (err) throw err;
      if (rows.length > 0)
      {
        let output = utils.wrapElm(`Listing (${rows.length}) items`);
        rows.forEach((row) => {
          output += utils.wrapElm(`Id (${row.id}) | importDate (${utils.simpleDateTime(new Date(row.importDate))}) | rawContent (${row.rawContent.length}) bytes`) + '\n';
        });
        res.send(utils.htmlDoc(output));
      }
      else
      {
        res.send(utils.htmlDoc(utils.wrapElm('No data')));
      }
    });
  }
  catch (ex) {
    res.send(utils.htmlDoc(utils.wrapElm(`Exception:<br>${ex.message}`,'b')));
  }
  finally {
    con.end();
  }
});

app.get('/api/truncate/imports', async (req, res) => await truncateTable(res, 'imports'));

app.get('/api/truncate/articles', async (req, res) => await truncateTable(res, 'articles'));

// read from DB and list all items
app.get('/api/articles', async (req, res) => {
  res.setHeader('Content-Type', returnType);
  const con = mysql.createConnection(db);
  try {
    con.query('select * from articles', (err, rows) => {
      if (err) throw err;
      if (rows.length > 0)
      {
        let output = utils.wrapElm(`Listing (${rows.length}) items`);
        rows.forEach((row) => {
          output += utils.dataCard(row.id, row.externalId, row.title, row.description, row.mainPicture);
        }); // <p>${JSON.stringify(row)}</p>
        res.send(utils.htmlDoc(output));
      }
      else
      {
        res.send(utils.htmlDoc(utils.wrapElm('No data')));
      }
    });
  }
  catch (ex) {
    res.send(utils.htmlDoc(utils.wrapElm(`Exception:<br>${ex.message}`,'b')));
  }
  finally {
    con.end();
  }
});

// consume the xml feed and populate DB
// https://www.lemonde.fr/rss/une.xml
app.post('/api/articles/import', async (req, res) => {
  res.setHeader('Content-Type', returnType);
  const con = mysql.createConnection(db);

  try {
    let output = '';
    const siteRssUrl = req.query.siteRssUrl;

    if (siteRssUrl)
    {
      if (utils.startsWithHttp(siteRssUrl))
      {
        output += utils.wrapElm(`Processing feed from url: ${siteRssUrl}`);

        // lemonde feed seems to have custom fields, so we define them here to make the parser aware of it
        const feed = await new Parser({
          customFields: {
            item: [
              ['description', 'description'],
              ['media:content', 'media:content', { keepArray: true }],
            ]
          }
        }).parseURL(siteRssUrl);

        if (feed && feed.items && feed.items.length > 0)
        {
          output += utils.wrapElm(`(${feed.items.length}) items processed`);

          const importDate = utils.simpleDateTime(new Date(feed.pubDate));
          const rawContent = utils.sqlSafe(JSON.stringify(feed));

          con.query(`insert into imports (importDate, rawContent) values ('${importDate}', '${rawContent}')`, err => {
            if (err) throw err;
          });

          feed.items.forEach(async (item) => {

            const externalId = item.guid;
            const title = utils.sqlSafe(item.title);
            const publicationDate = utils.simpleDateTime(new Date(item.pubDate));
            const description = utils.sqlSafe(item.description); //con.escape(item.description)
            const link = item.link;
            const mainPicture = item['media:content'][0]['$'].url;

            /*const sql = `
            replace into articles (externalId, importDate, title, publicationDate, description, link, mainPicture)
            values ('${externalId}', '${importDate}', '${title}', '${publicationDate}', '${description}', '${link}', '${mainPicture}');
            `;*/

            const sql = `
            insert into articles (externalId, importDate, title, publicationDate, description, link, mainPicture)
            values ('${externalId}', '${importDate}', '${title}', '${publicationDate}', '${description}', '${link}', '${mainPicture}')
            on duplicate key update importDate = '${importDate}', title = '${title}', publicationDate = '${publicationDate}', description = '${description}', link = '${link}', mainPicture = '${mainPicture}';
            `;

            con.query(sql, err => {
              if (err) throw err;
            });

          });
        }
        else
        {
          output += utils.wrapElm('Bad feed!');
        }
      }
      else
      {
        output += utils.wrapElm('Feed url does not start with "http(s)"!');
      }
    }
    else
    {
      output += utils.wrapElm('Need a feed url!');
    }

    res.send(utils.htmlDoc(output));
  }
  catch (ex) {
    res.send(utils.htmlDoc(utils.wrapElm(`Exception:<br>${ex.message}`,'b')));
  }
  finally {
    con.end();
  }
});

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`Listening on port ${port}`);
});

var truncateTable = async (res, table) => {
  res.setHeader('Content-Type', returnType);
  const con = mysql.createConnection(db);
  try {
    con.query(`truncate table ${table}`, () => {
      res.send(utils.htmlDoc(utils.wrapElm(`Done truncating '${table}' table!`)));
    });
  }
  catch (ex) {
    res.send(utils.htmlDoc(utils.wrapElm(`Exception:<br>${ex.message}`,'b')));
  }
  finally {
    con.end();
  }
}
