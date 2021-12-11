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
    console.log("whats up");
    let db = await getDBConnection();
    console.log("whats up2 ");
    if (req.query['search']) {
      let val = "'%" + req.query['search'] + "%'";
      //we can have an array of items that match up the item on client side js
      let sql = 'SELECT id FROM listing WHERE item LIKE ' + val;
      let ex1 = await db.all(sql);
      await db.close();
      res.json(ex1);
    } else {
      console.log("whats up3");
      let ex1 = await db.all('SELECT * FROM listing');
      console.log("whats up4");
      db.close();
      res.json(ex1);
    }
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(500).send('An error occurred on the server. Try again later.');
  }
});

/*
 * This endpoint provides the front end with all data related to individual products. For example,
 * if the user wanted to know more about an individual, this endpoint will provide them all the info
 */
// param will be the id of the card

// return a specific index id data for process.
app.get('/shopping/product/:product', async function(req, res) {
  try {
    let db = await getDBConnection();
    let product = "'" + req.params.user + "'";
    let select = 'SELECT users.username, product.name, indexed.price, indexed.quantity ';
    let from = 'FROM users, product, indexed '
    let where = 'WHERE indexed.user = users.id AND product.id = indexed.item AND users.id = ' + product;
    let ex1 = await db.all(select + where + from);
    if (ex1.length < 1) {
      res.type('text');
      res.status(400).send('Yikes. User does not exist.');
      return;
    }
    await db.close();
    res.json(ex1);
  } catch (err) {
    res.type('text');
    res.status(400).send('Yikes. User does not exist.');
  }
});

/*
 * This endpoint provides us information about the transactions of a user. Currently returning
 * all of the data.
 */
app.get('')

/*
 * This endpoint updates the backend with the new yip submitted by the client. Returns JSON
 * data back to the front end in the manner specified through the documentation.
 */
app.post('/login', async function(req, res) {
  try {
    let db = await getDBConnection();
    let name = req.body.name;
    let password = req.body.password;
    if (name.length < 1 || password.length < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let ex1 = await db.all('SELECT id FROM users WHERE username = "' + name + '" AND password = "' + password + '"');
    if (ex1.length < 1) {
      res.type('text');
      res.status(400).send('Incorrect username or password');
      return;
    }
    res.json(ex1);
  } catch (err) {
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

/*
 * This endpoint updates the backend with the new yip submitted by the client. Returns JSON
 * data back to the front end in the manner specified through the documentation.
 */
app.post('/signup', async function(req, res) {
  try {
    let db = await getDBConnection();
    let name = req.body.name;
    let password = req.body.password;
    let email = req.body.email;
    if (name.length < 1 || password.length < 1 || email < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let ex1 = await db.all('SELECT id FROM users WHERE username = "' + name + '"');
    if (ex1.length > 1) {
      res.type('text');
      res.status(400).send('Username already taken');
      return;
    } else {
      let sql = 'INSERT INTO users (username, password, email, monies) VALUES(?,?,?,?)';
      let ex2 = await db.run(sql, [name, password, email, 1000]);
    }
    res.type('text');
    res.send("success");
  } catch (err) {
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

//INSERT INTO indexed (user, item, price, quantity)
//VALUES ("3", "2", "10", "250");
//also have to increase the user money.

app.post('/shopping/sell', async function(req, res) {
  try {
    let db = await getDBConnection();
    let user = req.body.name; //int for user
    let item = req.body.item; //int for item
    let price = req.body.price; //int for price they are selling
    let quantity = req.body.quantity; //int for the quantity
    let total = price * quantity;
    if (user.length < 1 || item.length < 1 || price.length < 1 || quantity < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let sql = 'INSERT INTO indexed (user, item, price, quantity) VALUES(?, ?, ?, ?)';
    let ex1 = await db.run(sql, [user, item, price, quantity]);
    let sql2 = 'UPDATE users SET monies = monies + "' + total + '" WHERE username = ' + user;
    let ex2 = await db.run(sql2);
    res.json(ex2);
  } catch (err) {
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

//buy endpoint
app.post('/shopping/buy', async function(req, res) {
  try {
    let db = await getDBConnection();
    let id = req.body.id; //int id for the product they are buying
    let item = req.body.item;
    let price = req.body.price;
    let quantity = req.body.quantity;
    if (user.length < 1 || item.length < 1 || price.length < 1 || quantity < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let sql = 'INSERT INTO indexed (user, item, price, quantity) VALUES(?, ?, ?, ?)';
    let ex1 = await db.run(sql, [user, item, price, quantity]);
    if (ex1.length < 1) {
      res.type('text');
      res.status(400).send('Incorrect username or password');
      return;
    }
    res.json(ex1);
  } catch (err) {
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
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
