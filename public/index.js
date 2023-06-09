/**
 * Name: Nicholas Neshev and Faraz Qureshi
 * Date: 12/12/2021
 * Section: CSE 154 AB
 *
 * index.js file for our final project. This project sees that we create a ecommerce site
 * which intereacts with our own API to get information for the products. This
 * file includes methods for toggling the view of the webpage, generating product cards, and
 * interacting with the API.
 */
"use strict";

(function() {
  let sessionId;

  window.addEventListener("load", init);

  /**
   * Fills the webpage with cards, and adds event listeners for going to the home view, the history
   * view, the login view, handling searches, and handling buying/selling.
   */
  function init() {
    // Begin our webpage off by going to the login screen
    goLogin();

    // If there is already a session cookie, there is no need to login
    if (document.cookie.split('; ').find(row => row.startsWith('sessionid='))) {
      saveCookie();
      if (sessionId) {
        startWebsite();
      }
    }

    /** ------------------------------ Login Event Listeners ------------------------------ */
    let loginToggle = qs('#login label input');
    loginToggle.addEventListener("input", toggleLogin);

    qs('#login form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      loginUser();
    });

    /** ------------------------------ Navbar Event Listeners ------------------------------ */
    id("search-type").addEventListener("input", updateSearchProperties);

    id("search-term").addEventListener("input", searchCheck);

    id("search-btn").addEventListener("click", reqSearch);

    id("home-btn").addEventListener("click", goHome);

    id("history-btn").addEventListener("click", goHistory);

    id('sign-out-btn').addEventListener("click", logOut);

    /** ------------------------------ Filter Event Listeners ------------------------------ */
    let viewRadio = qsa('#visuals input[name=itemsView]');
    for (let i = 0; i < viewRadio.length; i++) {
      viewRadio[i].addEventListener("input", toggleHomeView);
    }

    id("filter-btn").addEventListener("click", updateFilters);

    /** ------------------------------ Single Event Listeners ------------------------------ */
    id("count").addEventListener("input", clearConfirmation);

    id('single-confirm-btn').addEventListener("click", confirmTransaction);

    id('single-submit-btn').addEventListener("click", submitTransaction);
  }

  /** ------------------------------ View Functions  ------------------------------ */

  /**
   * Shows a requested view, while hiding all other views
   * @param {String} viewName the name of the view to show
   */
  function showView(viewName) {
    if (viewName === "home") {
      id("search-term").disabled = false;
      id("search-type").disabled = false;
    } else {
      id("search-term").disabled = true;
      id("search-type").disabled = true;
    }
    let sections = qsa('#overall .view-border');
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].id === viewName) {
        sections[i].classList.remove('hidden');
        sections[i].classList.add('flex');
      } else {
        sections[i].classList.add('hidden');
        sections[i].classList.remove('flex');
      }
    }
  }

  /**
   * Shows the home view, ensuring that all products are visible and that the search bar is cleared.
   */
  function goHome() {
    clearSearch();
    showListings();
    qs("h1").textContent = "Browse our amazing products!";
    showView('home');
    id("visuals").classList.remove("hidden");
  }

  /**
   * Shows the history view, ensuring that the search bar is cleared
   */
  function goHistory() {
    clearSearch();
    reqUserHistory();
    qs("h1").textContent = "View your past purchases";
    showView("history");
  }

  /**
   * Shows the buy view
   */
  function goBuy() {
    qs("h1").textContent = "Buy this product!";
    showSingle();
    updateSingle(this.parentElement, "buy");
  }

  /**
   * Shows the sell view
   */
  function goSell() {
    qs("h1").textContent = "Sell this product!";
    showSingle();
    updateSingle(this.parentElement, "sell");
  }

  /**
   * Shows the single listing which will either be used for a buy or sell view, ensuring that
   * information from previous calls is cleared
   */
  function showSingle() {
    clearConfirmation();
    id("single").classList.remove("hidden");
  }

  /**
   * Hides the single listing that is used for a buy or sell view
   */
  function hideSingle() {
    id("single").classList.add("hidden");
  }

  /**
   * Shows the login view, ensuring that the navigation features are disabled and that information
   * from previous calls is cleared
   */
  function goLogin() {
    clearSearch();
    qs("h1").textContent = "Please enter your information :)";
    clearLogin();
    showView("login");
    disableNavButtons();
  }

  /** ------------------------------ Login Functions  ------------------------------ */

  /**
   * Clears all fields in the login view
   */
  function clearLogin() {
    let loginFields = qsa('#login input');
    for (let i = 0; i < loginFields.length; i++) {
      loginFields[i].value = "";
    }
  }

  /**
   * Saves a cookie
   */
  function saveCookie() {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionid='))
      .split('=')[1];
    sessionId = cookieValue;
  }

  /**
   * Switches between a menu for signing up and logging in
   */
  function toggleLogin() {
    clearLogin();
    let label = qs('#login form label');
    label.classList.toggle('hidden');
    let email = qs('#login form #email');
    email.required = !email.required;
    email.classList.toggle('hidden');
    let submitBtn = qs("#login form button");
    submitBtn.classList.toggle('login');
    submitBtn.classList.toggle('signup');
  }

  /**
   * Sends the form information to the respective function if we want to login a new user or an
   * existing user
   */
  function loginUser() {
    let user = id('name').value;
    let password = id('password').value;
    let params = new FormData();
    params.append('user', user);
    params.append('password', password);
    if (qs("#login form button").classList.contains("login")) {
      postLogin(params);
    } else if (qs("#login form button").classList.contains("signup")) {
      let email = id("email").value;
      params.append('email', email);
      postSignup(params);
    }
  }

  /**
   * fetch POSTS to the API to verify that provided login credentials exist in our db, and saves a
   * cookie for this user
   * @param {FormData} params the form that the login endpoint needs
   */
  async function postLogin(params) {
    let url = '/login';
    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      res = await res.json();
      saveCookie();
      processLogin(res);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * fetch POSTS to the API to add login credentials exist into our db, and saves a
   * cookie for this user
   * @param {FormData} params the form that the signup endpoint needs
   */
  async function postSignup(params) {
    let url = '/signup';
    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      res = await res.text();
      saveCookie();
      qs('#login label input').checked = false;
      toggleLogin();
      processLogin(res);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Helper function that logs the user out of their account by ending the cookie
   */
  async function logOut() {
    goLogin();
    updateUser();
    let container = id('history');
    container.innerHTML = "";
    let url = '/logout';
    try {
      let res = await fetch(url, {method: 'POST'});
      await statusCheck(res);
      res = await res.text();
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Enables website functionality if login was succesful
   * @param {text} res id of the user
   */
  function processLogin(res) {
    if (res.length > 0) {
      startWebsite();
    }
  }

  /**
   * Requests all listings, brings up the home view, and enables navigation
   */
  function startWebsite() {
    reqAllitems();
    goHome();
    enableNavButtons();
    updateUser();
  }

  /** ------------------------------ NavBar Functions  ------------------------------ */

  /**
   * Update user sets the money tab at the top to whatever cash that the user has
   */
  async function updateUser() {
    let user = await reqSessionDetails();
    let moneyTab = id('account-balance');
    if (user) {
      moneyTab.textContent = user.monies;
    } else {
      moneyTab.textContent = 0;
    }
  }

  /**
   * Enables all nav buttons, except search
   */
  function enableNavButtons() {
    let navBtns = qsa("nav button");
    for (let i = 1; i < navBtns.length; i++) {
      navBtns[i].disabled = false;
    }
  }

  /**
   * Disables all nav buttons
   */
  function disableNavButtons() {
    let navBtns = qsa("nav button");
    for (let i = 0; i < navBtns.length; i++) {
      navBtns[i].disabled = true;
    }
  }

  /**
   * Updates the type of our search input depending on the selected type of search
   */
  function updateSearchProperties() {
    clearSearch();
    let selectedType = id("search-type").value;
    let searchTerm = id("search-term");
    if (selectedType === "price") {
      searchTerm.type = "number";
    } else {
      searchTerm.type = "text";
    }
  }

  /**
   * Checks the contents of the search bar, and makes the search button appropiately enabled or
   * disabled if the search bar contents are valid
   */
  function searchCheck() {
    let but = id('search-btn');
    if (this.value.trim().length > 0) {
      but.disabled = false;
    } else {
      but.disabled = true;
    }
  }

  /**
   * Clears the text from the search input
   */
  function clearSearch() {
    id("search-term").value = "";
    id('search-btn').disabled = true;
  }

  /** ------------------------------ History Functions  ------------------------------ */
  /**
   * fetch GETs the transactions associated with our current user, then adds them to the history
   * container
   */
  async function reqUserHistory() {
    let url = "history/" + sessionId;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processAllHistory(res);
    } catch (err) {
      if (err.toString() === "Error: History does not exist yet!") {
        qs("h1").textContent = "No past purchases yet :(";
      } else {
        handleErr(err);
      }
    }
  }

  /**
   * Adds all given transactions into the history container
   * @param {JSON} res the transactions to add
   */
  function processAllHistory(res) {
    let info = res;
    let container = id('history');
    container.innerHTML = "";
    let len = Object.keys(res).length;
    for (let i = 0; i < len; i++) {
      let section1 = gen('section');
      section1.classList.add('transaction-container');
      let div1 = gen('div');
      let p1 = gen('p');
      p1.textContent = " Transaction ID: " + info[i].id + " ";
      div1.appendChild(p1);
      let d1 = divp("Total amount: $" + info[i].price * info[i].quantity);
      let d2 = divp("Item bought: " + info[i].itemName);
      let d3 = divp(" Total bought: " + info[i].quantity);
      section1.appendChild(div1);
      section1.appendChild(d1);
      section1.appendChild(d2);
      section1.appendChild(d3);
      container.prepend(section1);
    }
  }

  /**
   * Generates a simple div with a p inside of it that contains the contents of string
   * @param {string} string the text content of the p
   * @returns {div} a div containing the p
   */
  function divp(string) {
    let div2 = gen('div');
    let p2 = gen('p');
    p2.textContent = string;
    div2.appendChild(p2);
    return div2;
  }

  /** ------------------------------ Filter Functions  ------------------------------ */
  /**
   * Switches the home view between a grid and a list layout
   */
  function toggleHomeView() {
    id('home').classList.toggle('grid-layout');
    id('home').classList.toggle('list-layout');
  }

  /**
   * Filters the home contents to only contain the type of items that are selected
   */
  function updateFilters() {
    let filters = [];
    let filterBoxes = qsa("#visuals input[name=itemsFilter]");
    for (let i = 0; i < filterBoxes.length; i++) {
      if (filterBoxes[i].checked === false) {
        filters.push(filterBoxes[i].value);
      }
    }
    clearSearch();
    hideSingle();
    showListings();
    hideListings(filters, "type");
  }

  /**
   * Checks all filters
   */
  function fillFilters() {
    let filterBoxes = qsa("#visuals input[name=itemsFilter]");
    for (let i = 0; i < filterBoxes.length; i++) {
      filterBoxes[i].checked = true;
    }
  }

  /** ------------------------------ Home Functions  ------------------------------ */
  /**
   * Fetches infromation from the API about all of the listings in the database
   */
  async function reqAllitems() {
    let url = "/shopping/shop";
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processAllItems(res);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Adds all the listings in the database, as articles, into the home view container
   * @param {JSON} responseData json representation of all listings in the database
   */
  function processAllItems(responseData) {
    let container = id("home");
    let len = Object.keys(responseData).length;
    for (let i = 0; i < len; i++) {
      let curArticle = genCurListingArticle(responseData[i], true);
      container.appendChild(curArticle);
    }
  }

  /**
   * Creates and returns an article which represents the curListing
   * @param {JSON} curListing Current listing to use
   * @param {boolean} includeHovers Whether or not this product should have on-hover divs
   * @returns {article} an article containing all of the appropriate information of the listing
   */
  function genCurListingArticle(curListing, includeHovers) {
    let artcl = gen("article");
    let igIcn = gen("img");
    let dInfo = gen("div");
    let dPrdctLbl = genListingLabel(curListing);
    let dPrdctVal = genListingValue(curListing);

    artcl.classList.add('product');
    artcl.id = curListing.id + "-" + curListing.type + "-" + curListing.prodId;
    igIcn.src = "img/" + curListing.name + ".jpg";
    igIcn.alt = curListing.name;

    if (includeHovers) {
      let dPrdctHvrBuy = genListingHover("buy");
      dPrdctHvrBuy.addEventListener("click", goBuy);
      let dPrdctHvrSell = genListingHover("sell");
      dPrdctHvrSell.addEventListener("click", goSell);
      artcl.appendChild(dPrdctHvrBuy);
      artcl.appendChild(dPrdctHvrSell);
    }
    artcl.appendChild(igIcn);
    dInfo.appendChild(dPrdctLbl);
    dInfo.appendChild(dPrdctVal);
    artcl.appendChild(dInfo);
    return artcl;
  }

  /**
   * Creates and returns a div with appropiate classes for hover behavior
   * @param {string} type a buy or sell hover div
   * @returns {div} a div with appropiate information
   */
  function genListingHover(type) {
    let dHover = gen("div");
    let pHoverText = gen("p");

    dHover.classList.add('product-hover-div-' + type);
    if (type === "buy") {
      pHoverText.textContent = "Buy from this listing";
    } else if (type === "sell") {
      pHoverText.textContent = "Sell this kind of item";
    }
    pHoverText.classList.add('product-hover-text');

    dHover.appendChild(pHoverText);
    return dHover;
  }

  /**
   * Creates and returns a div which represents the labels of curListing
   * @param {JSON} curListing Current listing to use
   * @returns {div} a div containing the name and seller of curListing
   */
  function genListingLabel(curListing) {
    let dLabel = gen("div");
    let h2 = gen("h2");
    let pSellerTag = gen("p");
    let pSeller = gen("p");

    dLabel.classList.add('product-labels');
    h2.textContent = capFirstLetter(curListing.name);
    pSellerTag.textContent = "Seller:";
    pSellerTag.classList.add('product-seller-tag');
    pSeller.textContent = curListing.username;
    pSeller.classList.add('product-seller');

    dLabel.appendChild(h2);
    dLabel.appendChild(pSellerTag);
    dLabel.appendChild(pSeller);
    return dLabel;
  }

  /**
   * Capitalizes the first character of a string
   * @param {string} name the string to capitalize
   * @returns {string} name, but the first character is capitalized
   */
  function capFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Creates and returns a div which represents the values of curListing
   * @param {JSON} curListing Current listing to use
   * @returns {div} a div containing the price and quantity information of curListing
   */
  function genListingValue(curListing) {
    let dValue = gen("div");
    let pMoney = gen("p");
    let pAmountTag = gen("p");
    let pAmount = gen("p");

    dValue.classList.add('product-values');
    pMoney.textContent = curListing.price;
    pMoney.classList.add('product-money');
    pMoney.classList.add('curr-sign');
    pAmountTag.textContent = "Avaliable:";
    pAmountTag.classList.add('product-amount-tag');
    pAmount.textContent = curListing.quantity;
    pAmount.classList.add('product-amount');

    dValue.appendChild(pMoney);
    dValue.appendChild(pAmountTag);
    dValue.appendChild(pAmount);
    return dValue;
  }

  /** ------------------------------ GET for general info  ------------------------------ */
  /**
   * fetch GETs the information for a specific listing given only its ID
   * @param {number} listingID the number id of the listing
   * @returns {JSON} information about the listing
   */
  async function reqSingleListing(listingID) {
    let url = "/shopping/product/" + listingID;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      return res[0];
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * fetch GETs the information for a specific user given only their session ID
   * @returns {JSON} the username and userId of the user who is currently in session
   */
  async function reqSessionDetails() {
    let url = "/getuser/" + sessionId;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      return res[0];
    } catch (err) {
      handleErr(err);
    }
  }

  /** ------------------------------ Single Functions  ------------------------------ */
  /**
   * Updates the single listing view with the information of a new listing
   * @param {Element} product the .product container of the calling listing
   * @param {string} type a buy or sell listing view
   */
  async function updateSingle(product, type) {
    let title = id("single-title");
    let countInput = id("count");
    countInput.value = 1;

    let res = await reqSingleListing(product.id.split("-")[0]);

    if (type === "buy") {
      title.textContent = "How many of this listing would you like to buy?";
      countInput.max = res.quantity;
    } else if (type === "sell") {
      title.textContent = "You found 5 of this product lying around, sell some!";
      countInput.max = 5;
    }
    await inputSingleListing(res, type);
    let des = id("single-description");
    des.textContent = res.description;
    let submitBtn = id('single-submit-btn');
    submitBtn.removeAttribute("class");
    submitBtn.classList.add(type);
  }

  /**
   * Generates and inserts a listing into the single view
   * @param {JSON} res information about the listing
   * @param {string} type a buy or sell listing view
   */
  async function inputSingleListing(res, type) {
    let product = qs("#single .product");
    if (product) {
      id("single").removeChild(product);
    }
    let divAfter = qsa("#single > p")[1];
    if (type === "sell") {
      let sessionInfo = await reqSessionDetails();
      res.quantity = 5;
      res.username = sessionInfo.username;
    }
    id("single").insertBefore(genCurListingArticle(res, false), divAfter);
  }

  /** ------------------------------ Confirm Submit Functions  ------------------------------ */
  /**
   * Locks in the selected count for a transaction and enables the user to then submit this
   * transaction. Ensures that the user only selects a count as large as the listing's quantity,
   * and that the user cannot submit a count of 0.
   */
  function confirmTransaction() {
    id("single-response").textContent = "";
    let count = id("count");
    if (parseInt(count.max) < parseInt(count.value)) {
      count.value = count.max;
    }
    let countVal = count.value;
    let name = qs("#single .product h2");
    let price = qs("#single .product .product-money");
    let smry = id("single-summary");
    smry.textContent = countVal + " " + name.textContent.toLowerCase();
    let sumPrice = id("single-sum-price");
    sumPrice.textContent = parseInt(price.textContent) * parseInt(countVal);
    if (!(countVal === "0")) {
      id("single-submit-btn").disabled = false;
    } else {
      id("single-response").textContent = "There is no more of this product left";
    }
  }

  /**
   * Submits the selected count into either a buy or sell fetch POST
   */
  function submitTransaction() {
    clearConfirmation();
    let transactionType = id("single-submit-btn").classList[0];
    if (transactionType === "buy") {
      postBuy();
    } else if (transactionType === "sell") {
      postSell();
    }
  }

  /**
   * Clears all information regarding a confirmation
   */
  function clearConfirmation() {
    id("single-submit-btn").disabled = true;
    id("single-summary").textContent = "";
    id("single-sum-price").textContent = "";
  }

  /** ------------------------------ Buy/Sell Functions  ------------------------------ */
  /**
   * fetch POSTs a buy request which uses the count locked into the single listing view, then
   * updates the amount of money the user has, the quantity of the listing left remaining, and fetch
   * POSTs a new stored transaction
   */
  async function postBuy() {
    let singleId = qs("#single .product").id.split("-")[0];
    let singleUser = await reqSessionDetails();
    singleUser = singleUser.username;
    let singlePrice = qs("#single .product .product-money").textContent;
    let singleQuantity = id("count").value;

    let params = new FormData();
    params.append('id', singleId);
    params.append('user', singleUser);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);

    let url = "/shopping/buy/";
    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      updateUser();
      updateQuantities();
      postHistory();
    } catch (err) {
      if (err.toString() === "Error: insufficient funds") {
        id("single-response").textContent = "Not enough money to make this purchase";
      } else {
        handleErr(err);
      }
    }
  }

  /**
   * Updates the quantity of the listing found in single view to match the new listing count after
   * some of its quantity has been bought, and removes the listing from the home view if the
   * quantity drops to 0
   */
  function updateQuantities() {
    let singleId = qs("#single .product").id.split("-")[0];
    let curQuantity = parseInt(qs("#single .product-amount").textContent);
    let singleQuantity = id("count").value;
    let newQuantity = curQuantity - singleQuantity;

    id('count').max = newQuantity;
    if (newQuantity === 0) {
      id('count').min = 0;
    }
    qs("#single .product .product-amount").textContent = newQuantity;
    let allListings = qsa("#home .product");
    let neededListing;
    for (let i = 0; i < allListings.length; i++) {
      if (allListings[i].id.split("-")[0] === singleId) {
        neededListing = allListings[i];
      }
    }
    if (newQuantity === 0) {
      id("home").removeChild(neededListing);
    } else {
      neededListing.querySelector(".product-amount").textContent = newQuantity;
    }
  }

  /**
   * fetch POSTs a new transaction to be stored in our DB and displays the transaction id created
   * for this transaction
   */
  async function postHistory() {
    let userId = await reqSessionDetails();
    userId = userId.id;
    let singleItemId = qs("#single .product").id.split("-")[0];
    let singleItemName = qs("#single .product h2").textContent;
    let singlePrice = qs("#single .product .product-money").textContent;
    let singleQuantity = id("count").value;

    let params = new FormData();
    params.append('id', userId);
    params.append('item', singleItemId);
    params.append('itemName', singleItemName);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);
    let url = "update/history";
    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      res = await res.text();
      id("single-response").textContent = "Transaction ID: " + res;
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * fetch POSTs a new listing which uses the information in the single listing view, then updates
   * the funds of the user
   */
  async function postSell() {
    let userId = await reqSessionDetails();
    userId = "" + userId.id;
    let singleId = qs("#single .product").id.split("-")[2];
    let singlePrice = qs("#single .product .product-money").textContent;
    let singleQuantity = id("count").value;
    let params = new FormData();
    params.append('name', userId);
    params.append('item', singleId);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);
    let url = "/shopping/sell/";
    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      res = await res.text();
      updateUser();
      let listingJson = await reqSingleListing(res);
      id("home").appendChild(genCurListingArticle(listingJson, true));
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Fetches information from the API to get the ids of any listings that contain the value in the
   * search term of the type in the given selector, then hides all listings that aren't these ids
   */
  async function reqSearch() {
    fillFilters();
    hideSingle();

    let url = "/shopping/shop?search=" + id("search-term").value.trim() + "&type=" +
    id("search-type").value;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      hideSearchResult(res);
      id("search-btn").disabled = true;
    } catch (err) {
      handleErr(err);
    }
  }

  /**
   * Hides all listings that don't come up from a search result
   * @param {JSON} res the listings that did come up from a search result
   */
  function hideSearchResult(res) {
    let arr = [];
    for (let i = 0; i < Object.keys(res).length; i++) {
      arr.push("" + res[i].id);
    }
    showListings();
    hideListings(arr, "id");
  }

  /**
   * Make all listings visible
   */
  function showListings() {
    let articles = qsa("#home article");
    for (let i = articles.length - 1; i >= 0; i--) {
      articles[i].classList.remove('hidden');
    }
  }

  /**
   * Hides any listings as outline by match
   * @param {Array} match a list of yips ids
   * @param {string} filter a type or id search
   */
  function hideListings(match, filter) {
    let articles = qsa("#home > article");
    for (let i = 0; i < articles.length; i++) {
      let hide = false;
      if (filter === 'type') {
        if (match.includes(articles[i].id.split("-")[1])) {
          hide = true;
        }
      }
      if (filter === "id") {
        if (match.includes(articles[i].id.split("-")[0])) {
          hide = false;
        } else {
          hide = true;
        }
      }
      if (hide) {
        articles[i].classList.add('hidden');
      }
    }
  }

  /**
   * Generically handles any errors that we don't account for by changing to an error view that
   * needs a refresh to fix
   * @param {Error} err the error
   */
  function handleErr(err) {
    showView("error");
    id("error").textContent = id("error").textContent + " (" + err.toString() + ")";
    disableNavButtons();
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Checks the message of the API call, if it's not ok, throw an error
   * @param {object} res The API information
   * @returns {object} The same API information
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

})();