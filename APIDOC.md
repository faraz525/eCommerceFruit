# FN shopping API documentation
This API is designed to pull in requests for the front end to use for the site and all
of its functions.

## Generate all the shopping elements from the database
**Request Format:** /shopping/shop

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** This endpoint returns all the data from the database and sends it to the
front end.

**Example Request:** /shopping/shop

**Example Response:**

```
 {
    "username": "testing",
    "name": "wheat",
    "price": 5,
    "quantity": -50,
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

```
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

## Get a the individual product information requested by user.
**Request Format:** /shopping/product/:product

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Returns the specific information back about of the product

**Example Request:** /shopping/product/3

**Example Response:**

```json
  {
    "username": "Joe",
    "name": "wheat",
    "price": 5,
    "quantity": 0,
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

**Returned Data Format**: Plain Text

**Description:** Gets the data back to the client with all of their past information using
session id.

**Example Request:** /yipper/(sessionId);

**Example Response:**
```
{
    "username": "Joe",
    "name": "wheat",
    "price": 5,
    "quantity": 0,
    "id": 3,
    "description": "Wheat is a grass widely cultivated for its seed, a cereal grain which is a worldwide staple food."
  }

```

**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.


## Update the history of the user
**Request Format:** /update/history

**Request Type:** POST

**Returned Data Format**: text

**Description:** Makes a post request to update the transaction history accross the product.
Returns the text for the update.

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

**Description:** Makes a POST request to the database to understand if a user is logged in or not

**Example Request:** /update/history

**Example Response:**

```text
success

```

**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.

## Signs up a new user
**Request Format:** /signup

**Request Type:** POST

**Returned Data Format**: text

**Description:** Makes a post request to update the transaction history accross the product.
Returns the text for the update.

**Example Request:** /update/history

**Example Response:**

```text
5

```

**Error Handling:**
- Possible 400 (client error) if the client is missing one or more of the required
parameters.