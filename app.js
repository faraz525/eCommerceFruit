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
const multer = require("multer");
const cookieParser = require("cookie-parser");
const { restart } = require('nodemon');
app.use(cookieParser());

app.use(express.urlencoded({extended: true}));

app.use(express.json());

app.use(multer().none());
const COOKIE_EXPIRATION = 1000 * 60 * 60 * 3;
//Primary endpoint that allows the front end to request data about all the items on the website.
//handle the situation where we need to be able to search for different types of info.

//SELECT users.username, product.name, listing.price, listing.quantity FROM listing, users, product WHERE listing.user = users.id AND listing.item = product.id
//have search filters by
app.get('/shopping/shop', async function(req, res) {
  try{
    let db = await getDBConnection();
    let search = req.query['search'];
    let type = req.query['type'];
    if (search) {
      let val = "'%" + search + "%'";
      let ex1;
      //we can have an array of items that match up the item on client side js and just grab em
      if(type === 'item') {
        let sql = 'SELECT listing.id FROM listing, product WHERE listing.item = product.id AND product.name LIKE ' + val;
        ex1 = await db.all(sql);
      }
      else if(type === 'person') {
        let sql = 'SELECT listing.id FROM listing, users  WHERE listing.user = users.id AND users.username LIKE ' + val;
        ex1 = await db.all(sql);
      }
      else if(type == 'price') {
        let sql = 'SELECT id FROM listing WHERE price < ' + parseInt(search);
        ex1 = await db.all(sql);
      }
      await db.close();
      res.json(ex1);
    } else {
      let sql1 = 'SELECT users.username, product.name, listing.price, listing.quantity, listing.id, product.type, product.id AS prodId ';
      let sql2 = 'FROM listing, users, product ';
      let sql3 = 'WHERE listing.user = users.id AND listing.item = product.id';
      let ex1 = await db.all(sql1 + sql2 + sql3);
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
//gets more information about listing items
app.get('/shopping/product/:product', async function(req, res) {
  try {
    let db = await getDBConnection();
    let product = "'" + req.params.product + "'"; //the id of the listing item
    let select = 'SELECT users.username, product.name, listing.price, listing.quantity, listing.id, product.description, product.type, product.id AS prodId ';
    let from = 'FROM users, product, listing '
    let where = 'WHERE listing.user = users.id AND product.id = listing.item AND listing.id = ' + product;
    let sql = select + from + where;
    let ex1 = await db.all(sql);
    console.log(ex1);
    if (ex1.length < 1) {
      console.log("bruh");
      res.type('text');
      res.status(400).send('Yikes. product does not exist.');
      return;
    }
    await db.close();
    res.json(ex1);
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(400).send('Yikes. product does not exist.');
  }
});

//how we can grab the filter for individual people
//SELECT users.username, product.name, listing.price, listing.quantity
//FROM users, product, listing
//WHERE listing.user = users.id AND product.id = listing.item AND users.id = 3
//the sessionid of the user is being sent
app.get('/history/:user', async function(req, res) {
  try {
    let db = await getDBConnection();
    let nameId = req.params.user ;
    let sql = 'SELECT id FROM users WHERE sessionId = ' + "'" + nameId + "'";
    let id = await db.all(sql);
    let sql1 = 'SELECT * FROM transactions WHERE nameid = ' + id[0].id;
    let ex1 = await db.all(sql1);
    if (ex1.length < 1) {
      res.type('text');
      res.status(400).send('History does not exist yet!');
      return;
    }
    await db.close();
    res.json(ex1);
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(400).send('Yikes. product does not exist.');
  }
});

/*
 * This endpoint provides us information about the transactions of a user. Currently returning
 * all of the data.
 */
app.post('/update/history', async function(req, res) {
  res.type('text');
  try {
    let db = await getDBConnection();
    let id = req.body.id; //id of the user
    let item = req.body.item
    let itemname = req.body.itemName; //item name
    let price = req.body.price;
    let quantity = req.body.quantity;
    if (id.length < 1 || itemname.length < 1 || price.length < 1 || quantity.length < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let sql = 'INSERT INTO transactions (nameid, item, quantity, price, itemName) VALUES(?, ?, ?, ?, ?)'
    let ex1 = await db.run(sql, [id, item, quantity, price, itemname]);
    let sql2 = 'SELECT id FROM transactions WHERE nameid = ? AND item = ? AND quantity = ?';
    let ex2 = await db.run(sql2, [id, item, quantity]);
    console.log(ex2.lastID);
    res.send(ex2.lastID + "");
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

/*
 * This endpoint updates the backend with the new yip submitted by the client. Returns JSON
 * data back to the front end in the manner specified through the documentation.
 */
app.post('/login', async function(req, res) {
  try {
    let db = await getDBConnection();
    let password = req.body.password;
    let name = req.body.user;
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
    let id = await getSessionId();
    await setSessionId(id, name);
    res.cookie('sessionid', id, {expires: new Date(Date.now() + COOKIE_EXPIRATION)});
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
    let name = req.body.user;
    let password = req.body.password;
    let email = req.body.email;
    if (name.length < 1 || password.length < 1 || email.length < 1) {
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
      let sql = 'INSERT INTO users (username, password, email, monies, sessionId) VALUES(?,?,?,?,?)';
      let id = await getSessionId();
      await setSessionId(id, name);
      res.cookie('sessionid', id, {expires: new Date(Date.now() + COOKIE_EXPIRATION)});
      let ex2 = await db.run(sql, [name, password, email, 1000, id]);
    }
    res.type('text');
    res.send("success");
  } catch (err) {
    console.log(err);
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
    let sql = 'INSERT INTO listing (user, item, price, quantity) VALUES(?, ?, ?, ?)';
    let ex1 = await db.run(sql, [user, item, price, quantity]);
    let sql2 = 'UPDATE users SET monies = monies + ' + total + ' WHERE id = ' + user;
    let ex2 = await db.run(sql2);
    res.json(ex2.lastID);
  } catch (err) {
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

//buy endpoint, subtract quantity of the item bought, subtract person who bought monies,
app.post('/shopping/buy', async function(req, res) {
  try {
    let db = await getDBConnection();
    let id = req.body.id; //int id for the product they are buying
    let user = req.body.user; //string for the user
    //let item = req.body.item;
    let price = req.body.price; //int price of the item
    let quantity = req.body.quantity; //int quantity of the item
    let total = price * quantity;
    if (id.length < 1 || price.length < 1 || quantity < 1) {
      res.type('text');
      res.status(400).send('Missing one or more of the required params.');
      return;
    }
    let dbQuantity = await db.all('SELECT quantity FROM listing WHERE id = ' + id);
    let userMonies = await db.all('SELECT monies FROM users WHERE username = ' + "'" +user + "'");
    dbQuantity = dbQuantity[0];
    userMonies = userMonies[0];
    console.log(total + "------" + userMonies.monies)
    if(quantity > dbQuantity.quantity) {
      res.type('text');
      res.status(400).send('Too many items requested');
      return;
    }
    else if(parseInt(quantity) === parseInt(dbQuantity.quantity)) {
      let sql = 'DELETE FROM listing WHERE id = ' + id;
      let reso = db.run(sql);
    } else {
      if(parseInt(total) > parseInt(userMonies.monies)) {
        res.type('text');
        res.status(200).send("insufficient funds");
        return;
      }
      let sql1 = 'UPDATE listing SET quantity = quantity - ? WHERE id = ?;'
      let ex1 = await db.run(sql1, [quantity, id]);
    }
    let sql2 = 'UPDATE users SET monies = monies - ? WHERE username = ?';
    let ex2 = db.run(sql2, [total, user]);
    res.json(ex2);
  } catch (err) {
    console.log(err);
    res.type('text');
    res.status(400).send('Missing one or more of the required params.');
  }
});

// Logs a user out by expiring their cookie.
app.post('/logout', function(req, res) {
  res.type('text');
  let id = req.cookies['sessionid'];
  try {
    if (id) {
      res.clearCookie('sessionid');
      res.send('Successfully logged out!');
    } else {
      res.send('Already logged out.');
    }
  } catch (err) {
    res.status(500).send('issue with the server');
  }
});

app.get('/getuser/:user', async function(req, res) {
  res.type('text');
  let nameId = req.params.user;
  try {
    let db = await getDBConnection();
    let sql = 'SELECT username, id, monies FROM users WHERE sessionId = ' + "'" + nameId + "'";
    let id = await db.all(sql);
    res.send(id);
  } catch (err) {
    console.log(err);
    res.status('400').send('Cannot grab the user');
  }


});

/**
 * Sets the session id in the database to the given one for the given user.
 * @param {string} id - The Session id to set
 * @param {string} user - The username of the person to set the id for
 */
 async function setSessionId(id, user) {
  let query = 'UPDATE users SET sessionId = ? WHERE username = ?';
  let db = await getDBConnection();
  await db.all(query, [id, user]);
  await db.close();
}


/**
 * Generates an unused sessionid and returns it to the user.
 * @returns {string} - The random session id.
 */
 async function getSessionId() {
  let query = 'SELECT sessionId FROM users WHERE sessionid = ?';
  let id;
  let db = await getDBConnection();
  do {
    // This wizardry comes from https://gist.github.com/6174/6062387
    id = Math.random().toString(36)
      .substring(2, 15) + Math.random().toString(36)
      .substring(2, 15);
  } while (((await db.all(query, id)).length) > 0);
  await db.close();
  return id;
}

/**
 * Helper function to make an instance of the db and return it back to whatever requests.
 * @returns {sqlite3} responds with a db instance of the sqlite3.
 */
 async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'bingo.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || 8000;
app.listen(PORT);
