const communityRepoUrl = 'https://github.com/solacecommunity/solace-event-feeds';
const communityRepoRawUrl = 'https://raw.githubusercontent.com/solacecommunity';
const communityUserName = 'solacecommunity';
const communityRepoName = 'solace-event-feeds';
const communityFeedsJson = 'EVENT_FEEDS.json';

const openFeed = (feedName, source) => {
  console.log('I am here', feedName);
  const currLoc = $(location).attr('href');
  const url = new URL(currLoc);
  const site = url.host === 'solacecommunity.github.io' ? 'solace-event-feeds-site/' : '';
  console.log('URL', `http://${url.host}/${site}feed.html?feed=${feedName}&source=${source}`);
  window.open(`http://${url.host}/${site}feed.html?feed=${feedName}&source=${source}`, '_blank')
}

const getUser = async (url) => {
  try {
    const data = await fetch(url);
    return data.json();
  } catch (e) {
    console.log("There was an error fetching the data: " + error)
  }
}

var feeds = {};

const buildLunrIndex = async (data) => {
  feeds.data = data;
  feeds.documents = [];
  for (var i=0; i<data.length; i++) {
    feeds.documents.push({
      id: shortHash(data[i].source + '::' + data[i].name + '::' + data[i].type + '::' + data[i].contributor),
      ...data[i]
    })
  }

  feeds.db = feeds.documents.reduce(function (acc, document) {
    acc[document.id] = document
    return acc
  }, {})

  feeds.idx = lunr(function () {
    this.ref('id')
    this.field('title', { boost: 10 })
    this.field('description')
    this.field('contributor')
    this.field('source')
    this.field('name')
    this.field('description')
    this.field('domain')
    this.field('tags')
    feeds.documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  })

  return feeds;
}

const filterBySource = (evt) => {
  var data = evt.dataset;
  console.log(data)
  var searchInput = document.querySelector('.js-shuffle-search');
  searchInput.value = `source:${data.source}`;
  searchInput.dispatchEvent(new window.Event('keyup', { bubbles: true }));
}

const filterByDomain = (evt) => {
  var data = evt.dataset;
  console.log(data)
  var searchInput = document.querySelector('.js-shuffle-search');
  searchInput.value = `domain:${data.domain}`;
  searchInput.dispatchEvent(new window.Event('keyup', { bubbles: true }));
}

const filterByTag = (evt) => {
  var data = evt.dataset;
  console.log(data)
  var searchInput = document.querySelector('.js-shuffle-search');
  searchInput.value = `tags:${data.tag}`;
  searchInput.dispatchEvent(new window.Event('keyup', { bubbles: true }));
}

var allFeeds = {};

document.addEventListener("DOMContentLoaded", async () => {
  $.ajaxSetup({
      cache: false
  })

  try {
    const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    allFeeds = await fetch(path + `/feeds`, {
      method: "POST",
    })
    .then(d => d.json());;
  } catch (error) {
    console.log(error);
  }

  console.log(allFeeds);

  var data = [];
  var feedsList = [];
  var parent = $('#feeds-grid');
  for (var i=0; i<allFeeds?.communityFeeds.length; i++) {
    // var contributor = await getUser(`https://api.github.com/users/${feeds?.communityFeeds[i].github}`);
    allFeeds['communityFeeds'][i]['source'] = 'community';
    var feed = `
    <div class="col-xl-6">
      <div class="card info-card customers-card">
        <div class="card-body cart-tile">
          <h5 class="card-title">
            <div class="d-flex align-center space-between">
              <span>${allFeeds?.communityFeeds[i].type}</span>
              <span><span data-source="community" onclick="filterBySource(this)" class="nav-link-button badge">community</span></span>
            </div>
          </h5>

          <div class="d-flex align-items-center">
            <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
              <img class="rounded-circle card-icon" src="${allFeeds?.communityFeeds[i].img}">
            </div>
            <div class="ps-3">
              <h6 class="feed-tile"><a href="${allFeeds?.communityFeeds[i].github}" target="_blank">${allFeeds?.communityFeeds[i].name}</a> </h6>
              <div class="text-danger small pt-1 fw-bold">Contributor: <a href="https://github.com/${allFeeds?.communityFeeds[i].github}" target="_blank">${allFeeds?.communityFeeds[i].contributor}</a></div> 
            </div>
          </div>
          <div class="text-muted text-description small pt-2 ps-1">${allFeeds?.communityFeeds[i].description}</div>
          <div class="d-flex align-center space-between">
            <div class="ps-3">
              <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                allFeeds?.communityFeeds[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" onclick="filterByDomain(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
              <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
                allFeeds?.communityFeeds[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" onclick="filterByTag(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
            </div>
            <div class="ps-3 d-flex align-right">
              <button type="button" class="btn btn-outline-primary" onclick="openFeed('${allFeeds?.communityFeeds[i].name}', 'community')">Open</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
    parent.append( feed);
    feedsList.push(allFeeds?.communityFeeds[i]);
    data.push({source: 'community', id: shortHash(allFeeds?.communityFeeds[i].source + '::' + allFeeds?.communityFeeds[i].name + '::' + allFeeds?.communityFeeds[i].type + '::' + allFeeds?.communityFeeds[i].contributor),
                ...allFeeds?.communityFeeds[i]});
  }

  for (var i=0; i<allFeeds?.localFeeds.length; i++) {
    // var contributor = await getUser(`https://api.github.com/users/${feeds?.localFeeds[i].github}`);
    allFeeds['localFeeds'][i]['source'] = 'local';
      var feed = `
    <div class="col-xl-6">
      <div class="card info-card customers-card">
        <div class="card-body cart-tile">
          <h5 class="card-title">
            <div class="d-flex align-center space-between">
              <span>${allFeeds?.localFeeds[i].type}</span>
              <span><span data-source="local" onclick="filterBySource(this)" class="nav-link-button badge">local</span></span>
            </div>
          </h5>

          <div class="d-flex align-items-center">
            <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
              <img class="rounded-circle card-icon" src="${allFeeds?.localFeeds[i].img ? allFeeds?.localFeeds[i].img : 'assets/img/defaultfeed.png'}">
            </div>
            <div class="ps-3">
              <h6 class="feed-tile"><a href="${allFeeds?.localFeeds[i].github}" target="_blank">${allFeeds?.localFeeds[i].name}</a> </h6>
              <div class="text-danger small pt-1 fw-bold">Contributor: <a href="https://github.com/${allFeeds?.localFeeds[i].github}" target="_blank">${allFeeds?.localFeeds[i].contributor}</a></div> 
            </div>
          </div>
          <div class="text-muted text-description small pt-2 ps-1">${allFeeds?.localFeeds[i].description}</div>
          <div class="d-flex align-center space-between">
            <div class="ps-3">
              <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                allFeeds?.localFeeds[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" onclick="filterByDomain(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
              <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
                allFeeds?.localFeeds[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" onclick="filterByTag(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
            </div>
            <div class="ps-3 d-flex align-right">
              <button type="button" class="btn btn-outline-primary" onclick="openFeed('${allFeeds?.localFeeds[i].name}', 'local')">Open</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
    parent.append( feed);
    feedsList.push(allFeeds?.localFeeds[i]);
    data.push({source: 'local', id: shortHash(allFeeds?.localFeeds[i].source + '::' + allFeeds?.localFeeds[i].name + '::' + allFeeds?.localFeeds[i].type + '::' + allFeeds?.localFeeds[i].contributor),
              ...allFeeds?.localFeeds[i]});
  }

  feeds = await buildLunrIndex(data);
  
  _handleSearchKeyup = async (evt) => {
    const searchText = evt.target.value.toLowerCase();
    var results = feeds.idx.search(searchText);
    results.forEach(function (result) {
      return feeds.db[result.ref]
    })
  
    var parent = $('#feeds-grid');
    parent.empty();
    
    var ids = results.map(r => r.ref);
    for (var i=0; i<feeds.documents.length; i++) {
      if (!ids.includes(shortHash(feeds.documents[i].source + '::' + feeds.documents[i].name + '::' + feeds.documents[i].type + '::' + feeds.documents[i].contributor)))
        continue;

      // var contributor = await getUser(`https://api.github.com/users/${data[i].github}`);
      console.log('I am here', data[i].name, data[i].source)

      var feed = `
      <div class="col-xl-6">
        <div class="card info-card customers-card">
          <div class="card-body cart-tile">
            <h5 class="card-title">
              <div class="d-flex align-center space-between">
                <span>${data[i].type}</span>
                <span><span data-source="${data[i].source}" onclick="filterBySource(this)" class="nav-link-button badge">${data[i].source}</span></span>
              </div>
            </h5>
  
            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img class="rounded-circle card-icon" src="${data[i].img ? data[i].img : 'assets/img/defaultfeed.png'}">
              </div>
              <div class="ps-3">
                <h6 class="feed-tile"><a href="${data[i].github}" target="_blank">${data[i].name}</a> </h6>
                <div class="text-danger small pt-1 fw-bold">Contributor: <a href="https://github.com/${data[i].github}" target="_blank">${data[i].contributor}</a></div> 
              </div>
            </div>
            <div class="text-muted text-description small pt-2 ps-1">${data[i].description}</div>
            <div class="d-flex align-center space-between">
              <div class="ps-3">
                <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                  data[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" onclick="filterByDomain(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
                }</div>
                <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
                  data[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" onclick="filterByTag(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
                }</div>
              </div>
              <div class="ps-3 d-flex align-right">
                <button type="button" class="btn btn-outline-primary" onclick="openFeed('${data[i].name}', '${data[i].source}')">Open</button>
              </div>
            </div>
  
          </div>
        </div>
      </div>
    `
  
      parent.append( feed);
    }
  
  
  }

  _handleSort = async (evt) => {
    var ids = [];
    const mode = evt.target.dataset.mode;
    var data = feedsList
    if (mode === 'alphadown') {
      let btnX = document.getElementById('sort-alpha-up')
      btnX.classList.remove('active')
      let btn = document.getElementById('sort-alpha-down')
      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
      } else {
        btn.classList.add('active')
        data.sort((a, b) => a.name.localeCompare(b.name));
      }
    } else if (mode === 'alphaup') {
      let btnX = document.getElementById('sort-alpha-down')
      btnX.classList.remove('active')
      let btn = document.getElementById('sort-alpha-up')
      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
      } else {
        btn.classList.add('active')
        data.sort((a, b) => b.name.localeCompare(a.name));
      }
    } else if (mode === 'recent') {
      let btnX = document.getElementById('sort-alpha-up')
      btnX.classList.remove('active')
      btnX = document.getElementById('sort-alpha-down')
      btnX.classList.remove('active')
      let btn = document.getElementById('sort-recent')
      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
      } else {
        btn.classList.add('active')
        data.sort((b, a) => new Date(a.lastUpdated) - new Date(b.lastUpdated));
      }
    }

    feeds = await buildLunrIndex(data);
  
    const searchText = evt.target.value;
    if (searchText) {
      var results = feeds.idx.search(searchText.toLowerCase());
      results.forEach(function (result) {
        return feeds.db[result.ref]
      })
      ids = results.map(r => r.ref);
    } else {
      ids = feeds.documents.map(d => d.id);
    }


    var parent = $('#feeds-grid');
    parent.empty();
    
    for (var i=0; i<data.length; i++) {
      if (!ids.includes(shortHash(data[i].source + '::' + data[i].name + '::' + data[i].type + '::' + data[i].contributor)))
        continue;

      // var contributor = await getUser(`https://api.github.com/users/${data[i].github}`);
  
      var feed = `
      <div class="col-xl-6">
        <div class="card info-card customers-card">
          <div class="card-body cart-tile">
            <h5 class="card-title">
              <div class="d-flex align-center space-between">
                <span>${data[i].type}</span>
                <span><span data-source="${data[i].source}" onclick="filterBySource(this)" class="nav-link-button badge">${data[i].source}</span></span>
              </div>
            </h5>
  
            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img class="rounded-circle card-icon" src="${data[i].img ? data[i].img : 'assets/img/defaultfeed.png'}">
              </div>
              <div class="ps-3">
                <h6 class="feed-tile"><a href="${data[i].github}" target="_blank">${data[i].name}</a> </h6>
                <div class="text-danger small pt-1 fw-bold">Contributor: <a href="https://github.com/${data[i].github}" target="_blank">${data[i].contributor}</a></div> 
              </div>
            </div>
            <div class="text-muted text-description small pt-2 ps-1">${data[i].description}</div>
            <div class="d-flex align-center space-between">
              <div class="ps-3">
                <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                  data[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" onclick="filterByDomain(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
                }</div>
                <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
                  data[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" onclick="filterByTag(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
                }</div>
              </div>
              <div class="ps-3 d-flex align-right">
                <button type="button" class="btn btn-outline-primary" onclick="openFeed('${data[i].name}', '${data[i].source}')">Open</button>
              </div>
            </div>
  
          </div>
        </div>
      </div>
    `
  
      parent.append( feed);
    }
  }

  // filtering
  const searchInput = document.querySelector('.js-shuffle-search');
  searchInput.addEventListener('keyup', _handleSearchKeyup);
  searchInput.addEventListener('search', _handleSearchKeyup);

  // sorting
  const sortFeed = document.querySelectorAll('.sort-feed');
  sortFeed.forEach(el => el.addEventListener('click', _handleSort));
});

async function exitAndCloseTool() {
  exitTool();
  window.close();
}

async function exitTool() {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  window.location.href = path + '/exit.html';
  try {
    await fetch(path + `/exit`, {
      method: "POST",
    });
    window.close();
  } catch (error) {
    console.log(error);
  }
}
