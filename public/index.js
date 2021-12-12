/**
 * Name: Nicholas Neshev
 * Date: 11/30/2021
 * Section: CSE 154 AB
 *
 * yipper.js file for project 4 - yipper. This assignmnet sees that we create a social media
 * platform in a webpage which intereacts with our own API to get information for the "yips". This
 * file includes methods for toggling the view of the webpage, generating yip cards, and interacting
 * with the API.
 */
"use strict";

(function () {
  let sessionId;

  window.addEventListener("load", init);

  /**
  * Fills the webpage with yips, and adds event listeners for going to the home view, the new view,
  * handling searches, and handling new yips.
  */
  function init() {
    goLogin();
    if (document.cookie.split('; ').find(row => row.startsWith('sessionid='))) {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        .split('=')[1];
      sessionId = cookieValue;
      console.log(sessionId);
      if (cookieValue) {
        startWebsite();
      }
    }

    updateUser();

    //Login event listeners
    let loginToggle = qs('#login label input');
    loginToggle.addEventListener("input", toggleLogin);

    qs('#login form').addEventListener('submit', (ev) => {
      ev.preventDefault();
      loginUser();
    });

    //Navbar event listeners
    let searchSelector = id("search-type");
    searchSelector.addEventListener("input", updateSearchProperties);

    let searchTerm = id("search-term");
    searchTerm.addEventListener("input", searchCheck);

    let searchBtn = id("search-btn");
    searchBtn.addEventListener("click", reqSearch);

    let homeBtn = id("home-btn");
    homeBtn.addEventListener("click", goHome);

    let historyBtn = id("history-btn");
    historyBtn.addEventListener("click", goHistory);

    let signOutBtn = id('sign-out-btn');
    signOutBtn.addEventListener("click", logOut);

    //Filter event listeners
    let viewRadio = qsa('#visuals input[name=itemsView]');
    for(let i = 0; i < viewRadio.length; i++) {
      viewRadio[i].addEventListener("input", toggleHomeView);
    }

    let filterBtn = id("filter-btn");
    filterBtn.addEventListener("click", updateFilters);

    //Single event listeners
    let countInput = id("count");
    countInput.addEventListener("input", clearConfirmation);

    let confirmTransactionBtn = id('single-confirm-btn');
    confirmTransactionBtn.addEventListener("click", confirmTransaction);

    let submitTransactionBtn = id('single-submit-btn');
    submitTransactionBtn.addEventListener("click", submitTransaction);
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
      } else {
        sections[i].classList.add('hidden');
      }
    }
  }

  /**
  * Shows the home view, ensuring that all yips are visible and that the search bar is cleared.
  */
  function goHome() {
    clearSearch();
    showProducts();
    qs("h1").textContent = "Browse our amazing products!";
    showView('home');
    id("visuals").classList.remove("hidden");
  }

  /**
  * Shows the history view, ensuring that the search bar is cleared
  */
   async function goHistory() {
    clearSearch();
    reqUserHistory();
    qs("h1").textContent = "View your past purchases";
    showView("history");
  }

  function goBuy() {
    qs("h1").textContent = "Buy this product!";
    showSingle();
    updateSingle(this.parentElement, "buy");
  }

  function goSell() {
    qs("h1").textContent = "Sell this product!";
    showSingle();
    updateSingle(this.parentElement, "sell");
  }

  function showSingle() {
    id("single").classList.remove("hidden");
  }

  function hideSingle() {
    id("single").classList.add("hidden");
  }

  function goLogin() {
    clearSearch();
    qs("h1").textContent = "Please enter your information :)";
    showView("login");
    disableNavButtons();
    let loginFields = qsa('#login input');
    for (let i = 0; i < loginFields.length; i++) {
      loginFields[i].value = "";
    }
  }

  /** ------------------------------ Login Functions  ------------------------------ */

  /**
  * Update user simply sets the money tab at the top to whatever cash that the user has
  */
  async function updateUser() {
    let user = await reqSessionDetails();
    let moneyTab = id('account-balance');
    if(user) {
      moneyTab.textContent = user.monies;
    } else {
      moneyTab.textContent = 0;
    }
  }

  /**
  * Helper function that is used to toggle the login fields and make the email field visible
  */
  function toggleLogin() {
    let label = qs('#login form label');
    label.classList.toggle('hidden');
    let email = qs('#login form #email');
    email.required = !email.required;
    email.classList.toggle('hidden');
    let submitBtn = qs("#login form button");
    submitBtn.classList.toggle('login')
    submitBtn.classList.toggle('signup')
  }

  async function loginUser() {
    let user = id('name').value;
    let password = id('password').value;
    let params = new FormData();
    params.append('user', user);
    params.append('password', password);
    if(qs("#login form button").classList.contains("login")) {
      postLogin(params);
    } else if (qs("#login form button").classList.contains("signup")) {
      let email = id("email").value
      params.append('email', email);
      postSignup(params);
    }
  }

  /**
  * Function that is used to send information up to the API for the login
  * @param {JSON} params The params needed in order to send infromation to API
  */
  async function postLogin(params) {
    let url = '/login';
    try {
      let res = await fetch(url, { method: 'POST', body: params });
      await statusCheck(res);
      res = await res.json();
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        .split('=')[1];
      sessionId = cookieValue;
      processLogin(res);
    } catch (err) {
      handleErr(err);
    }
  }

  async function postSignup(params) {
    let url = '/signup';
    try {
      let res = await fetch(url, { method: 'POST', body: params });
      await statusCheck(res);
      console.log(res);
      res = await res.text();
      console.log(res);
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        .split('=')[1];
      sessionId = cookieValue
      qs('#login label input').checked = false;
      toggleLogin();
      processLogin(res);
    } catch (err) {
      handleErr(err);
    }
  }

  /**
  * Helper function the log the user out of their account by ending the cookie
  */
  async function logOut() {
    goLogin();
    updateUser();
    let container = id('history');
    container.innerHTML = "";
    let url = '/logout';
    try {
      let res = await fetch(url, { method: 'POST' });
      await statusCheck(res);
      res = await res.text();
    } catch (err) {
      handleErr(err);
    }
  }

  function processLogin(res) {
    if (res.length > 0) {
      startWebsite();
    }
  }

  function startWebsite() {
    reqAllitems();
    goHome();
    enableNavButtons();
    updateUser();
  }

  /** ------------------------------ NavBar Functions  ------------------------------ */
  function enableNavButtons() {
    let navBtns = qsa("nav button");
    for (let i = 1; i < navBtns.length; i++) {
      navBtns[i].disabled = false;
    }
  }

  function disableNavButtons() {
    let navBtns = qsa("nav button");
    for (let i = 0; i < navBtns.length; i++) {
      navBtns[i].disabled = true;
    }
  }

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
  async function reqUserHistory() {
    let url = "history/" + sessionId;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processAllHistory(res);
    } catch (err) {
      console.log(err.toString());
      if(err.toString() === "Error: History does not exist yet!") {
        qs("h1").textContent = "No past purchases yet :(";
      } else {
        handleErr(err);
      }
    }
  }

  async function processAllHistory(res) {
    let info = res;
    let container = id('history');
    container.innerHTML = "";
    let len = Object.keys(res).length;
    for (let i = 0; i < len; i++) {
      let section1 = gen('section')
      section1.classList.add('transaction-container');
      let div1 = gen('div');
      let p1 = gen('p')
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

  function divp(string) {
    let div2 = gen('div');
    let p2 = gen('p');
    p2.textContent = string;
    div2.appendChild(p2);
    return div2;
  }


  /** ------------------------------ Filter Functions  ------------------------------ */
  function toggleHomeView() {
    id('home').classList.toggle('gridLayout');
    id('home').classList.toggle('listLayout');
  }

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
    showProducts();
    hideProducts(filters, "type");
  }

  function fillFilters() {
    let filterBoxes = qsa("#visuals input[name=itemsFilter]");
    for (let i = 0; i < filterBoxes.length; i++) {
      filterBoxes[i].checked = true;
    }
  }

  /** ------------------------------ Home Functions  ------------------------------ */
  /**
  * Fetches infromation from the API about all of the yips in the database
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
  * Adds all the yips in the database, as articles, into the home view container
  * @param {JSON} responseData json representation of all yips in the database
  */
  function processAllItems(responseData) {
    let container = id("home");
    let len = Object.keys(responseData).length;
    for (let i = 0; i < len; i++) {
      let curArticle = genCurProductArticle(responseData[i], true);
      container.appendChild(curArticle);
    }
  }

  /**
  * Creates and returns an article which represents the curYip
  * @param {JSON} curYip Current yip to use
  * @returns {article} an article containing all of the appropriate information of the yip
  */
  function genCurProductArticle(curProduct, includeHovers) {
    let artcl = gen("article");
    let igIcn = gen("img");
    let dInfo = gen("div");
    let dPrdctLbl = genProductLabel(curProduct);
    let dPrdctVal = genProductValue(curProduct);

    artcl.classList.add('product');
    artcl.id = curProduct.id + "-" + curProduct.type + "-" + curProduct.prodId;
    igIcn.src = "img/" + curProduct.name + ".jpg";
    igIcn.alt = curProduct.name;

    if (includeHovers) {
      let dPrdctHvrBuy = genProductHover("buy");
      dPrdctHvrBuy.addEventListener("click", goBuy);
      let dPrdctHvrSell = genProductHover("sell");
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

  function genProductHover(type) {
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
  * Creates and returns a div which represents the content of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the name and yip of curYip
  */
  function genProductLabel(curProduct) {
    let dLabel = gen("div");
    let h2 = gen("h2");
    let pSellerTag = gen("p");
    let pSeller = gen("p");

    dLabel.classList.add('product-labels');
    h2.textContent = capFirstLetter(curProduct.name);
    pSellerTag.textContent = "Seller:";
    pSellerTag.classList.add('product-seller-tag');
    pSeller.textContent = curProduct.username;
    pSeller.classList.add('product-seller');

    dLabel.appendChild(h2);
    dLabel.appendChild(pSellerTag);
    dLabel.appendChild(pSeller);
    return dLabel;
  }

  /**
  * Converts a name as found in the database into the format of the image names
  * @param {String} name the database formatted name to convert
  * @returns {String} the name formated as an img name
  */
  function capFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
  * Creates and returns an div which represents the metadata of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the like and date information of curYip
  */
  function genProductValue(curProduct) {
    let dValue = gen("div");
    let pMoney = gen("p");
    let pAmountTag = gen("p");
    let pAmount = gen("p");

    dValue.classList.add('product-values');
    pMoney.textContent = curProduct.price;
    pMoney.classList.add('product-money');
    pMoney.classList.add('currSign');
    pAmountTag.textContent = "Avaliable:"
    pAmountTag.classList.add('product-amount-tag');
    pAmount.textContent = curProduct.quantity;
    pAmount.classList.add('product-amount');

    dValue.appendChild(pMoney);
    dValue.appendChild(pAmountTag);
    dValue.appendChild(pAmount);
    return dValue;
  }

  /** ------------------------------ GET for general info  ------------------------------ */
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
  async function updateSingle(product, type) {
    let title = id("single-title");
    let countInput = id("count");
    countInput.value = 1;

    let res = await reqSingleListing(product.id.split("-")[0]);
    console.log(res);

    if (type === "buy") {
      title.textContent = "How many of this listing would you like to buy?"
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

  async function inputSingleListing(res, type) {
    let product = qs("#single .product");
    if (product) {
      id("single").removeChild(product);
    }
    let divAfter = qsa("#single > p")[1]
    if (type === "sell") {
      let sessionInfo = await reqSessionDetails();
      res.quantity = 5;
      res.username = sessionInfo.username;
    }
    id("single").insertBefore(genCurProductArticle(res, false), divAfter);
  }

  /** ------------------------------ Confirm Submit Functions  ------------------------------ */
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
    if(!(countVal === "0")){
      id("single-submit-btn").disabled = false;
    } else {
      id("single-response").textContent = "There is no more of this product left"
    }
  }

  function submitTransaction() {
    clearConfirmation();
    let transactionType = id("single-submit-btn").classList[0];
    if (transactionType === "buy") {
      postBuy();
    } else if (transactionType === "sell") {
      postSell();
    }
  }

  function clearConfirmation() {
    id("single-submit-btn").disabled = true;
    id("single-summary").textContent = "";
    id("single-sum-price").textContent = "";
  }


  /** ------------------------------ Buy/Sell Functions  ------------------------------ */
  async function postBuy() {
    let singleId = qs("#single .product").id.split("-")[0];
    let singleUser = await reqSessionDetails();
    singleUser = singleUser.username;
    let singlePrice = qs("#single .product .product-money").textContent
    let singleQuantity = id("count").value;

    let params = new FormData();
    params.append('id', singleId)
    params.append('user', singleUser);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);

    let url = "/shopping/buy/"
    try {
      let res = await fetch(url, { method: 'POST', body: params });
      console.log(res);
      await statusCheck(res);
      updateUser();
      updateQuantities();
      postHistory();
    } catch (err) {
      console.log(err.toString());
      if(err.toString() === "Error: insufficient funds") {
        id("single-response").textContent = "Not enough money to make this purchase"
      } else {
        handleErr(err);
      }
    }
  }

  function updateQuantities() {
    let singleId = qs("#single .product").id.split("-")[0];
    let curQuantity = parseInt(qs("#single .product-amount").textContent);
    let singleQuantity = id("count").value;
    let newQuantity = curQuantity - singleQuantity;

    console.log(newQuantity);
    id('count').max = newQuantity;
    if( newQuantity === 0) {
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
    if(newQuantity === 0) {
      id("home").removeChild(neededListing);
    } else {
      neededListing.querySelector(".product-amount").textContent = newQuantity;
    }
  }

  async function postHistory() {
    let userId = await reqSessionDetails();
    userId = userId.id;
    let singleItemId = qs("#single .product").id.split("-")[0];
    let singleItemName = qs("#single .product h2").textContent;
    let singlePrice = qs("#single .product .product-money").textContent;
    let singleQuantity = id("count").value;
    let params = new FormData();
    params.append('id', userId)
    params.append('item', singleItemId);
    params.append('itemName', singleItemName);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);
    let url = "update/history"
    try {
      let res = await fetch(url, { method: 'POST', body: params });
      await statusCheck(res);
      res = await res.text();
      id("single-response").textContent = "Transaction ID: " + res;
    } catch (err) {
      handleErr(err);
    }
  }

  async function postSell() {
    let userId = await reqSessionDetails();
    userId = "" + userId.id;
    let singleId = qs("#single .product").id.split("-")[2];
    let singlePrice = qs("#single .product .product-money").textContent
    let singleQuantity = id("count").value;
    let params = new FormData();
    params.append('name', userId)
    params.append('item', singleId);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);
    let url = "/shopping/sell/";
    try {
      let res = await fetch(url, { method: 'POST', body: params });
      await statusCheck(res);
      res = await res.text();
      updateUser();
      let listingJson = await reqSingleListing(res);
      id("home").appendChild(genCurProductArticle(listingJson, true));
    } catch (err) {
      handleErr(err);
    }
  }

  /**
  * Fetches information from the API to get the ids of any yips that contain the text in the search
  * term
  */
  async function reqSearch() {
    fillFilters();
    hideSingle();

    let url = "/shopping/shop?search=" + id("search-term").value.trim() + "&type=" + id("search-type").value;
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
  * hides the search results
  */
  function hideSearchResult(res){
    let arr = [];
      for(let i = 0; i < Object.keys(res).length; i++) {
        arr.push("" + res[i].id);
      }
    showProducts();
    hideProducts(arr, "id");
  }

  /**
  * Makes all items visible
  */
  function showProducts() {
    let articles = qsa("#home article");
    for (let i = articles.length - 1; i >= 0; i--) {
      articles[i].classList.remove('hidden');
    }
  }

  /**
  * Hides any yips which are not found in responseData
  * @param {JSON} responseData a list of yips ids
  */
  function hideProducts(match, filter) {
    console.log(match);
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
 * Helper function that serves to handle any error that occurs the platform.
 */
  function handleErr(err) {
    console.error(err);
    let single = id('home');
    let error = id('error');
    showView("error");
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