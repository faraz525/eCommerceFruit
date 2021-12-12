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

  let BASE_URL = "/shopping/";
  let SESSIONID;

  window.addEventListener("load", init);

  /**
  * Fills the webpage with yips, and adds event listeners for going to the home view, the new view,
  * handling searches, and handling new yips.
  */
  function init() {
    reqAllitems();
    if (document.cookie.split('; ').find(row => row.startsWith('sessionid='))) {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        .split('=')[1];
      SESSIONID = cookieValue;
      console.log(SESSIONID);
      if (cookieValue) {
        goHome();
        enableNavButtons();
      }
    }
    let loginToggle = qs('#login label input');
    loginToggle.addEventListener("input", toggleLogin);

    let searchTerm = id("search-term");
    searchTerm.addEventListener("input", searchCheck);

    let searchBtn = id("search-btn");
    searchBtn.addEventListener("click", reqSearch);

    let homeBtn = id("home-btn");
    homeBtn.addEventListener("click", goHome);

    let historyBtn = id("history-btn");
    historyBtn.addEventListener("click", goHistory);

    let viewRadioGrid = qsa('#visuals input[name=itemsView]')[0];
    viewRadioGrid.addEventListener("input", toggleHomeView);
    let viewRadioList = qsa('#visuals input[name=itemsView]')[1];
    viewRadioList.addEventListener("input", toggleHomeView);

    let filterBtn = id("filter-btn");
    filterBtn.addEventListener("click", updateFilters);

    let signOutBtn = id('sign-out-btn');
    signOutBtn.addEventListener("click", logOut);

    let countInput = id("count");
    countInput.addEventListener("input", clearConfirmation);

    let confirmTransactionBtn = id('single-confirm-btn');
    confirmTransactionBtn.addEventListener("click", confirmTransaction);

    let submitTransactionBtn = id('single-submit-btn');
    submitTransactionBtn.addEventListener("click", submitTransaction);

    console.log(qs('#login form'));
    qs('#login form').addEventListener('submit', (ev) => {
      ev.preventDefault();

      loginUser();
    });
  }

  function toggleLogin() {
    let label = qs('#login form label');
    label.classList.toggle('hidden');
    let email = qs('#login form #email');
    email.required = !email.required;
    email.classList.toggle('hidden');
  }

  function revealLoginPage() {
    id('login').classList.remove('hidden');
  }

  async function loginUser() {

    let url = '/login'
    let user = id('name').value;
    let password = id('password').value;
    let params = new FormData();
    params.append('user', user);
    params.append('password', password);

    try {
      let res = await fetch(url, { method: 'POST', body: params });
      await statusCheck(res);
      res = await res.json();
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        .split('=')[1];
      SESSIONID = cookieValue;
      processLogin(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  async function logOut() {
    goLogin();

    let url = '/logout';
    try {
      let res = await fetch(url, { method: 'POST' });
      await statusCheck(res);
      res = await res.text();
      console.log(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  //NEED TO DO COOKIES HERE
  function processLogin(res) {
    if (res.length > 0) {
      console.log("Success");
      goHome();
      enableNavButtons();
    }
  }


  /**
  * Shows a requested view, while hiding all other views
  * @param {String} viewName the name of the view to show
  */
  function showView(viewName) {
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
    showView('home');
    id("visuals").classList.remove("hidden");
  }

  function toggleHomeView() {
    id('home').classList.toggle('gridLayout');
    id('home').classList.toggle('listLayout');
  }

  /**
  * Shows the history view, ensuring that the search bar is cleared
  */
  async function goHistory() {
    clearSearch();
    showView("history");
    let url = "history/" + SESSIONID;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processAllHistory(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  function processAllHistory(res) {
    let info = res;
    console.log(info);
    let container = id('history');
    let section1 = gen('section')
    section1.classList.add('transaction-container');
    let div1 = gen('div');
    let p1 = gen('p')
    p1.textContent = "Transaction ID: " + info.id;
    div1.appendChild(p1);
    let div2 = gen('div');
    let p2 = gen('p')
    p2.textContent = "Total amount: $" + info.price * info.quantity;
    div2.appendChild(p2);
    section1.appendChild(div1);
    section1.appendChild(div2);
    let hr = gen('hr');
    section1.appendChild(hr);
    let art = genCurProductArticle(info[0], false);
    section1.appendChild(art);
    container.appendChild(section1);

  }

  function goBuy() {
    showSingle();
    updateSingle(this.parentElement, "buy");
  }

  function goSell() {
    showSingle();
    updateSingle(this.parentElement, "sell");
  }

  function showSingle() {
    clearSearch();
    id("single").classList.remove("hidden");
  }

  function goLogin(){
    clearSearch();
    showView("login");
  }

  function enableNavButtons() {
    let navBtns = qsa("nav button");
    for (let i = 1; i < navBtns.length; i++) {
      navBtns[i].disabled = false;
    }
  }

  /**
  * Clears the text from the search input
  */
  function clearSearch() {
    id("search-term").value = "";
    id('search-btn').disabled = true;
  }

  /**
  * Logic to determine if the search buttons should be enables or not
  */
  function updateSearch() {
    let content = this.value.trim();
    if (content.length > 0) {
      searchEnable();
    } else {
      searchDisable();
    }
  }

  /**
  * Fetches infromation from the API about all of the yips in the database
  */
  async function reqAllitems() {
    let url = BASE_URL + "shop";
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processAllitems(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
  * Adds all the yips in the database, as articles, into the home view container
  * @param {JSON} responseData json representation of all yips in the database
  */
  function processAllitems(responseData) {
    console.log(responseData);
    let container = id("home");
    let len = Object.keys(responseData).length;
    for (let i = 0; i < len; i++) {
      let curArticle = genCurProductArticle(responseData[i], true);
      console.log(curArticle);
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
    artcl.id = curProduct.id + "-" + curProduct.type;
    igIcn.src = "img/" + curProduct.name + ".jpg";
    igIcn.alt = curProduct.name;

    if (includeHovers) {
      let dPrdctHvrBuy = genProductHoverBuy();
      dPrdctHvrBuy.addEventListener("click", goBuy);
      let dPrdctHvrSell = genProductHoverSell();
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
  * Creates and returns a div which represents the content of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the name and yip of curYip
  */
  function genProductHoverBuy() {
    let dHoverBuy = gen("div");
    let pHoverTextBuy = gen("p");

    dHoverBuy.classList.add('product-hover-div-buy');
    pHoverTextBuy.textContent = "Buy from this listing";
    pHoverTextBuy.classList.add('product-hover-text');

    dHoverBuy.appendChild(pHoverTextBuy);
    return dHoverBuy;
  }

  /**
  * Creates and returns a div which represents the content of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the name and yip of curYip
  */
  function genProductHoverSell() {
    let dHoverSell = gen("div");
    let pHoverTextSell = gen("p");

    dHoverSell.classList.add('product-hover-div-sell');
    pHoverTextSell.textContent = "Sell this kind of item";
    pHoverTextSell.classList.add('product-hover-text');

    dHoverSell.appendChild(pHoverTextSell);
    return dHoverSell;
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

  async function updateSingle(product, type) {
    let title = id("single-title");
    let countInput = id("count");
    countInput.value = 1;
    let res = await reqSingleProduct(product.id.split("-")[0], type);
    if (type === "buy") {
      title.textContent = "How many of this listing would you like to buy?"
      countInput.max = res.quantity;
    } else if (type === "sell") {
      title.textContent = "You found 5 of this product lying around, sell some!";
      countInput.max = 5;
    }
    let des = id("single-description");
    des.textContent = res.description;
    let submitBtn = id('single-submit-btn');
    submitBtn.removeAttribute("class");
    submitBtn.classList.add(type);
  }

  async function reqSingleProduct(productID, type) {
    let url = BASE_URL + "product/" + productID;
    console.log(url);
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      await inputSingleProduct(res, type);
      return res[0];
    } catch (err) {
      errorHandler(err);
    }
  }

  async function inputSingleProduct(res, type) {
    let product = qs("#single .product");
    if (product) {
      id("single").removeChild(product);
    }
    let divAfter = qsa("#single > p")[1]
    if (type === "sell") {
      let sessionInfo = await reqSessionDetails();
      res[0].quantity = 5;
      res[0].username = sessionInfo[0].username;
    }
    id("single").insertBefore(genCurProductArticle(res[0], false), divAfter);
  }

  function confirmTransaction(){
    let countVal = id("count").value;
    let name = qs("#single .product h2");
    let price = qs("#single .product .product-money");
    let smry = id("single-summary");
    smry.textContent = countVal + " " + name.textContent.toLowerCase();
    let sumPrice = id("single-sum-price");
    sumPrice.textContent = parseInt(price.textContent) * parseInt(countVal);
    id("single-submit-btn").disabled = false;
  }

  function submitTransaction() {
    clearConfirmation();
    let transactionType = id("single-submit-btn").classList[0];
    if (transactionType === "buy") {
      postBuy();
      updateQuantities();
    } else if (transactionType === "sell") {
      postSell();
    }
    id("count").value = 1;
  }

  function clearConfirmation() {
    id("single-submit-btn").disabled = true;
    id("single-summary").textContent = "";
    id("single-sum-price").textContent = "";
  }

  async function postBuy(){
    let singleId = qs("#single .product").id.split("-")[0];
    let singleUser = qs("#single .product .product-seller").textContent;
    let singlePrice = qs("#single .product .product-money").textContent
    let singleQuantity = id("count").value;

    let params = new FormData();
    params.append('id', singleId)
    params.append('user', singleUser);
    params.append('price', singlePrice);
    params.append('quantity', singleQuantity);

    let urlBuy = BASE_URL + "buy"
    let urlHistory = "update/history"
    try {
      let res = await fetch(urlBuy, { method: 'POST', body: params });
      await statusCheck(res);
      res = await fetch(urlHistory, { method: 'POST', body: params });
      await statusCheck(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  function updateQuantities() {
    let singleId = qs("#single .product").id.split("-")[0];
    let curQuantity = parseInt(qs("#single .product-amount").textContent);
    let singleQuantity = id("count").value;
    let newQuantity = curQuantity - singleQuantity;
    id('count').max = newQuantity;
    qs("#single .product .product-amount").textContent = newQuantity;
    let allListings = qsa("#home .product");
    let neededListing;
    for (let i = 0; i < allListings.length; i++) {
      if (allListings[i].id.split("-")[0] === singleId) {
        neededListing = allListings[i];
      }
    }
    neededListing.querySelector(".product-amount").textContent = newQuantity;
  }

  async function reqSessionDetails() {
    console.log(SESSIONID);
    let url = "/getuser/" + SESSIONID;
    console.log(url);
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      return res;
    } catch (err) {
      errorHandler(err);
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
  * Fetches information from the API to get the ids of any yips that contain the text in the search
  * term
  */
  async function reqSearch() {
    console.log(id("searchType").value);
    let url = BASE_URL + "shop?search=" + id("search-term").value.trim() + "&type=" + id("searchType").value;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      id("search-btn").disabled = true;
      console.log(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  function updateFilters() {
    let filters = [];
    let filterBoxes = qsa("#visuals input[name=itemsFilter]");
    for (let i = 0; i < filterBoxes.length; i++) {
      if (filterBoxes[i].checked === false) {
        filters.push(filterBoxes[i].value);
      }
    }
    console.log(filters);
    showProducts();
    hideProducts(filters, "type");
  }

  /**
  * Makes all yips visible
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
    let articles = qsa("#home > article");
    for (let i = 0; i < articles.length; i++) {
      let hide = false;
      if (filter === 'type') {
        if (match.includes(articles[i].id.split("-")[1])) {
          console.log();
          hide = true;
        }
      }
      if (filter === "id") {
        if (match.includes(articles[i].id.split("-")[0])) {
          console.log();
          hide = true;
        }
      }
      if (hide) {
        articles[i].classList.add('hidden');
      }
    }
  }

  /**
  * Fetch POSTs information to the API to update the likes of the calling user
  */
  async function reqLike() {
    let url = BASE_URL + "likes";
    let id = this.parentElement.parentElement.parentElement.id;

    let params = new FormData();
    params.append("id", id);

    try {
      let res = await fetch(url, { method: "POST", body: params });
      await statusCheck(res);
      res = await res.text();
      updateLikes(this.parentElement, res);
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
  * Updates the like count of the yip visually on the webpage
  * @param {div} parElem the div which contains the like information
  * @param {*} num the new like value to use
  */
  function updateLikes(parElem, num) {
    let pLike = parElem.querySelector("p");
    pLike.textContent = num;
  }

  /**
  * Fetch POSTs information to the API to update the database with a new yip
  */
  async function reqNewYip() {
    let url = BASE_URL + "new";

    let params = new FormData(qs("#new form"));
    qs("#new form #name").value = "";
    qs("#new form #yip").value = "";
    try {
      let res = await fetch(url, { method: "POST", body: params });
      await statusCheck(res);
      res = await res.json();
      updateNewYip(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
  * Updates the home container to hold the new yip found in responseData, then brings the client to
  * the home view after 2 seconds
  * @param {JSON} responseData JSON representation of the yip
  */
  function updateNewYip(responseData) {
    let container = id("home");
    container.prepend(genCurYipArticle(responseData));
    setTimeout(goHome, 2000);
  }

  /**
  * Disables all website functionality and displays the error biew
  * @param {text} err The content of the error message
  */
  function errorHandler(err) {
    /*
    id('yipper-data').classList.add('hidden');
    id('error').classList.remove('hidden');
    let navBtns = qsa("nav button");
    for (let i = 0; i < navBtns.length; i++) {
      navBtns[i].disabled = true;
    }
    */
    console.error(err);
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