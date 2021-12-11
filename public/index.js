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

(function() {

  let BASE_URL = "/yipper/";

  window.addEventListener("load", init);

  /**
  * Fills the webpage with yips, and adds event listeners for going to the home view, the new view,
  * handling searches, and handling new yips.
  */
  function init() {
    reqAllitems();
    let id = window.
    console.log(id);
    let searchTerm = id("search-term");
    searchTerm.addEventListener("input", searchCheck);

    let searchBtn = id("search-btn");
    searchBtn.addEventListener("click", reqSearch);

    let homeBtn = id("home-btn");
    homeBtn.addEventListener("click", goHome);

    let historyBtn = id("history-btn");
    historyBtn.addEventListener("click", goHistory);

    console.log(qs('#login form'));
    qs('#login form').addEventListener('submit', (ev) => {
      ev.preventDefault();

      loginUser();
    });
  }

  async function loginUser() {

    let url = '/login'
    let user = id('name').value;
    let password = id('password').value;
    let params = new FormData();
    params.append('user', user);
    params.append('password', password);

    try {
      let res = await fetch(url, {method: 'POST', body: params});
      await statusCheck(res);
      res = await res.json();
      processLogin(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  //NEED TO DO COOKIES HERE
  function processLogin(res) {
    if(res.length > 0) {
      console.log("Success");
      goHome();

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
        console.log(sections[i]);
        sections[i].classList.remove('hidden');
      } else {
        sections[i].classList.add('hidden');
      }
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
  * Shows the home view, ensuring that all yips are visible and that the search bar is cleared.
  */
  function goHome() {
    clearSearch();
    showYips();
    showView('home');
    id("visuals").classList.remove("hidden");
    id("single").classList.remove("hidden");
  }

  /**
  * Shows the user view, ensuring that it is refreshed and that the search bar is cleared.
  */
  function goUser() {
    clearSearch();
    id("user").innerHTML = "";
    showView("user");
    reqUserYips(this.textContent);
  }

  /**
  * Shows the cart view, ensuring that the search bar is cleared
  */
   function goHistory() {
     console.log("this is a plea for help");
    clearSearch();
    showView("history");
    console.log("If God exists, then why do I not feel his mercy?")
  }

  /**
  * Fetches infromation from the API about all of the yips in the database
  */
  async function reqAllitems() {
    let url = "shopping/shop";
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
    // responseData = responseData.yips;
    // let container = id("home");
    // let len = Object.keys(responseData).length;
    // for (let i = 0; i < len; i++) {
    //   let curArticle = genCurYipArticle(responseData[i]);
    //   container.appendChild(curArticle);
    // }
  }

  /**
  * Creates and returns an article which represents the curYip
  * @param {JSON} curYip Current yip to use
  * @returns {article} an article containing all of the appropriate information of the yip
  */
  function genCurYipArticle(curYip) {
    let artcl = gen("article");
    let igIcn = gen("img");
    let dYpCnt = genYipContent(curYip);
    let dMeta = genYipMeta(curYip);

    artcl.classList.add('card');
    artcl.id = curYip.id;
    igIcn.src = "img/" + nameToImgName(curYip.name) + ".png";
    igIcn.alt = curYip.name + " icon";

    artcl.appendChild(igIcn);
    artcl.appendChild(dYpCnt);
    artcl.appendChild(dMeta);
    return artcl;
  }

  /**
  * Converts a name as found in the database into the format of the image names
  * @param {String} name the database formatted name to convert
  * @returns {String} the name formated as an img name
  */
  function nameToImgName(name) {
    let parsedName = name.split(" ");
    let ret = parsedName[0].toLowerCase();
    for (let i = 1; i < parsedName.length; i++) {
      ret = ret + "-" + parsedName[i].toLowerCase();
    }
    return ret;
  }

  /**
  * Creates and returns a div which represents the content of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the name and yip of curYip
  */
  function genYipContent(curYip) {
    let dYpCnt = gen("div");
    let pNme = gen("p");
    let pYp = gen("p");

    pNme.textContent = curYip.name;
    pNme.classList.add('individual');
    pNme.addEventListener("click", goUser);
    pYp.textContent = curYip.yip + " #" + curYip.hashtag;

    dYpCnt.appendChild(pNme);
    dYpCnt.appendChild(pYp);
    return dYpCnt;
  }

  /**
  * Creates and returns an div which represents the metadata of curYip
  * @param {JSON} curYip Current yip to use
  * @returns {div} a div containing the like and date information of curYip
  */
  function genYipMeta(curYip) {
    let dMeta = gen("div");
    let pDate = gen("p");
    let dLke = gen("div");
    let igLke = gen("img");
    let pLke = gen("p");

    dMeta.classList.add('meta');
    pDate.textContent = new Date(curYip.date).toLocaleString();
    igLke.src = "img/heart.png";
    igLke.alt = "heart";
    igLke.addEventListener("click", reqLike);
    pLke.textContent = curYip.likes;

    dLke.appendChild(igLke);
    dLke.appendChild(pLke);
    dMeta.appendChild(pDate);
    dMeta.appendChild(dLke);
    return dMeta;
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
    showView('home');
    let url = BASE_URL + "yips?search=" + id("search-term").value.trim();
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      id("search-btn").disabled = true;
      showYips();
      hideYips(res.yips);
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
  * Makes all yips visible
  */
  function showYips() {
    let articles = qsa("#home article");
    for (let i = articles.length - 1; i >= 0; i--) {
      articles[i].classList.remove('hidden');
    }
  }

  /**
  * Hides any yips which are not found in responseData
  * @param {JSON} responseData a list of yips ids
  */
  function hideYips(responseData) {
    let articles = qsa("#home article");
    let resIndex = 0;
    for (let i = articles.length - 1; i >= 0; i--) {
      let hide = true;
      if (resIndex < Object.keys(responseData).length) {
        if ("" + responseData[resIndex].id === "" + articles[i].id) {
          hide = false;
          resIndex++;
        }
      }
      if (hide) {
        articles[i].classList.add('hidden');
      }
    }
  }

  /**
  * Fetches information from the API to get yips made by a specific user
  * @param {String} userName the name of the user to search for
  */
  async function reqUserYips(userName) {
    let url = BASE_URL + "user/" + userName;
    try {
      let res = await fetch(url);
      await statusCheck(res);
      res = await res.json();
      processUserYips(res);
    } catch (err) {
      errorHandler(err);
    }
  }

  /**
  * Adds all yips in responseData, as ps, into a new article container
  * @param {JSON} responseData the list of yips to process
  */
  function processUserYips(responseData) {
    let container = gen("article");
    container.classList.add("single");
    let head2 = gen("h2");
    head2.textContent = "Yips shared by " + responseData[0].name + ":";
    container.appendChild(head2);

    let len = Object.keys(responseData).length;
    let yipNum = 1;
    for (let i = 0; i < len; i++) {
      let curYip = genUserCurYip(responseData[i], yipNum);
      yipNum++;
      container.appendChild(curYip);
    }
    id("user").appendChild(container);
  }

  /**
  * Creates and returns a p which represents the content of curYip
  * @param {JSON} curUserYip Current yip to use
  * @param {number} num the number count that this yip is
  * @returns {p} a p containing the yip of curYip
  */
  function genUserCurYip(curUserYip, num) {
    let p = gen("p");
    p.textContent = "Yip " + num + ": " + curUserYip.yip + " #" + curUserYip.hashtag;
    return p;
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
      let res = await fetch(url, {method: "POST", body: params});
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
      let res = await fetch(url, {method: "POST", body: params});
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
    id('yipper-data').classList.add('hidden');
    id('error').classList.remove('hidden');
    let navBtns = qsa("nav button");
    for (let i = 0; i < navBtns.length; i++) {
      navBtns[i].disabled = true;
    }
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