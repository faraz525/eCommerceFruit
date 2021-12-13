# FN shopping API documentation
This API is designed to interface the database that stores all items related to fn shopping
to the front end. There are a multitude of endpoints so users can see items, buy items, sell items,
and more.

## Generate all the shopping elements from the database
**Request Format:** /shopping/shop

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint returns all the data for products and reuturns the information
to the front end with information on who is selling, name of the product, and more.
If there is a search query, the type and search response can be sent in to which coresponding
objects will appear.

**Example Request:** /shopping/shop

**Example Response:**

```JSON
 {
    "username": "testing",
    "name": "wheat",
    "price": 5,
    "quantity": 50,
    "id": 1,
    "type": "grains"
  },
  {
    "username": "Bobby",
    "name": "barley",
    "price": 10,
    "quantity": 0,
    "id": 2,
    "type": "grains"
  },
  {
    "username": "Joe",
    "name": "wheat",
    "price": 5,
    "quantity": 0,
    "id": 3,
    "type": "grains"
  },

```

**Example Request:** /yipper/yips?id=barley&type=item

**Example Response:**

```JSON
  {
    "id": 1
  },
  {
    "id": 3
  },
  {
    "id": 12
  }
```

**Error Handling:**
Error 500 if the server cannot load up the request.


## Get a the individual listing information for users
**Request Format:** /shopping/product/:product

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns the specific information about the listing of the product including
who is selling the item at what price and with how much quantity.

**Example Request:** /shopping/product/3

**Example Response:**

```json
  {
    "username": "Joe",
    "name": "wheat",
    "price": 5,
    "quantity": 2,
    "id": 3,
    "description": "Wheat is a grass widely cultivated for its seed, a cereal grain which is a worldwide staple food."
  }

```
**Error Handling:**
Possible 400 (client error) if the client entered in the wrong user and the server
has no matches for it on the db.

## Find the history for a specific user
**Request Format:** /history/:user

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Gets the data back to the client with all of their past transactions using the
session id that they are logged in with.

**Example Request:** /yipper/s6siuk47dnw0vvtp1rfoo

**Example Response:**
```JSON
{
    "username": "Joe",
    "name": "wheat",
    "price": 5,
    "quantity": 0,
    "id": 3,
  }

```

**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.
- Possible 400 (client error) if the user does not have any history


## Update the history of the user
**Request Format:** /update/history

**Request Type:** POST

**Returned Data Format**: text

**Description:** Makes a post request to update the transaction history for the user and across
the website in general. Returns the last ID that is created.

**Example Request:** /update/history

**Example Response:**

```text
5

```
**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.


## Post a new yip from the user.
**Request Format:** /login

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** Makes a POST request to the database to determine if user is logged in.

**Example Request:** /login

**Example Response:**

```JSON

form info

```

**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.
- Possible 400 (client error) if the username or password is incorrect

## Signs up a new user
**Request Format:** /signup

**Request Type:** POST

**Returned Data Format**: text

**Description:** Makes a post request create a new user with fields of email, name, and password.
This endpoint additionally determins if a username is unique

**Example Request:** /update/signup

**Example Response:**

```text
success

```

**Error Handling:**
- Possible 400 (client error) if the username is not something unique. Or wrong fields are inputted


## Logs in a sell request
**Request Format:** /shopping/sell

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** This endpoint can be used to process sell requests from the user and update the
backend with the information about the new listing on the website with information such as
the seller, item, price, quantity. Returns the last id for the sell.

**Example Request:** /shopping/sell

**Example Response:**

```text
{"id": "8"}

```

**Error Handling:**
- Possible 400 (client error) if there arent enough parameters


## Logs in a buy request
**Request Format:** /shopping/buy

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** This endpoint can be used to process buy requests from the user and update the
backend with the information about their purchase such as the transactions.

**Example Request:** /shopping/buy

**Example Response:**

```JSON
form info

```

**Error Handling:**
- Possible 400 (client error) if there arent enough parameters or they are incorrect
- Possible 400 (client error) if the user does not have enough money to make the purchase
- Possible 400 (client error) if the user tries to buy more of the item than is avaliable


## Logsout the user
**Request Format:** /logout

**Request Type:** POST

**Returned Data Format**: text

**Description:** This endpoint can be used to logout a user and thus delete their session cookies.

**Example Request:** /logout

**Example Response:**

```test
successfully logged out

```

**Error Handling:**
- Possible 500 (server error) if there arent enough parameters or they are incorrect


## Logsout the user
**Request Format:** /logout

**Request Type:** POST

**Returned Data Format**: text

**Description:** This endpoint can be used to logout a user and thus delete their session cookies.

**Example Request:** /logout

**Example Response:**

```test
successfully logged out

```

**Error Handling:**
- Possible 500 (server error) if there arent enough parameters or they are incorrect


## Logsout the user
**Request Format:** /getuser/:user

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint gets information about an individual user and their monies, id, etc

**Example Request:** /getuser/testing

**Example Response:**

```json
  {
    "username": "testing",
    "id": 1,
    "monies": 65
  }

```

**Error Handling:**
- Possible 400 (server error) if the user does not exist




