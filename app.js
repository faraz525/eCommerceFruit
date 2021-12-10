/*
 *Faraz Qureshi & Nicholas Neshev
 *12/3/21
 *This is my server side JS code where I build up a NodeJS server responsible for interacting
 * with our sqlite database. This file is responsible for providing front end with various
 * endpoints.
 */
'use strict';
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

//Primary endpoint that allows the front end to request data about all the items on the website.
app.get('/shopping/shop', async function(req, res) {
  try{
    let db = await getDBConnection();
    if (req.query['search']) {
      let val = "'%" + req.query['search'] + "%'";
      let sql = 'SELECT id FROM index WHERE name LIKE ' + val;
      let ex1 = await db.all(sql);
      await db.close();
      res.json(ex1);
    } else {
      let ex1 = await db.all('SELECT * FROM index ORDER BY date DESC');
      db.close();
      res.json(ex1);
    }
  } catch (err) {
    res.type('text');
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

/**
 * Helper function to make an instance of the db and return it back to whatever requests.
 * @returns {sqlite3} responds with a db instance of the sqlite3.
 */
 async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'yipper.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
