const communityRepoUrl = 'https://github.com/solacecommunity/solace-event-feeds';
const communityRepoRawUrl = 'https://raw.githubusercontent.com';
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
    this.field('type')
    this.field('contributor')
    this.field('source')
    this.field('name')
    this.field('domain')
    this.field('tags')
    feeds.documents.forEach(function (doc) {
      this.add(doc)
    }, this)
  })

  return feeds;
}

const filterByType = (evt) => {
  var data = evt.dataset;
  console.log(data)
  var searchInput = document.querySelector('.js-shuffle-search');
  searchInput.value = `type:${data.type}`;
  searchInput.dispatchEvent(new window.Event('keyup', { bubbles: true }));
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

  var isLocal = localStorage.getItem('isLocal');
  if (isLocal === 'true') isLocal = true;
  else isLocal = false;
  if (isLocal) {
    try {
      const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
      allFeeds = await fetch(path + `/feeds?isLocal=${isLocal}`, {
        method: "POST",
      })
      .then(d => d.json());;
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      var communityFeeds = await fetch(`${communityRepoRawUrl}/${communityUserName}/${communityRepoName}/main/${communityFeedsJson}`)
        .then(d => d.json());
      allFeeds['communityFeeds'] = communityFeeds;
    } catch (error) {
      console.log(error);
    }
  }

  console.log(allFeeds);

  var data = [];
  var feedsList = [];

  if (localStorage.getItem('view') === 'grid') {
    var parent = $('#feeds-grid');
    for (var i=0; i<allFeeds?.communityFeeds.length; i++) {
      // var contributor = await getUser(`https://api.github.com/users/${feeds?.communityFeeds[i].github}`);
      allFeeds['communityFeeds'][i]['source'] = 'community';
      var feed = `
      <div class="col-xl-4">
        <div class="card info-card customers-card">
          <div class="card-body cart-tile">
            <h5 class="card-title">
              <div class="d-flex align-center space-between">
                <span><span data-type="${allFeeds?.communityFeeds[i].type}" onclick="filterByType(this)" class="nav-link-button badge">${allFeeds?.communityFeeds[i].type}</span></span>
                <span><span data-source="community" onclick="filterBySource(this)" class="nav-link-button badge">community</span></span>
              </div>
            </h5>

            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img class="rounded-circle card-icon" src="${allFeeds?.communityFeeds[i].img}">
              </div>
              <div class="ps-3">
                <h6 class="feed-tile fw-bold"><a href="https://github.com/solacecommunity/solace-event-feeds/tree/main/${allFeeds?.communityFeeds[i].name}" target="_blank">${allFeeds?.communityFeeds[i].name}</a> </h6>` +
                (allFeeds?.communityFeeds[i].github ?
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${allFeeds?.communityFeeds[i].github}" target="_blank">${allFeeds?.communityFeeds[i].contributor}</a></div>` :
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${allFeeds?.communityFeeds[i].contributor}</div>`
                ) +
              `</div>
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
                <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${allFeeds?.communityFeeds[i].name}', 'community')">Open</button>
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

    if (isLocal) {
      for (var i=0; i<allFeeds?.localFeeds.length; i++) {
        // var contributor = await getUser(`https://api.github.com/users/${feeds?.localFeeds[i].github}`);
        allFeeds['localFeeds'][i]['source'] = 'local';
        var feed = `
        <div class="col-xl-4">
          <div class="card info-card customers-card">
            <div class="card-body cart-tile">
              <h5 class="card-title">
                <div class="d-flex align-center space-between">
                <span><span data-type="${allFeeds?.localFeeds[i].type}" onclick="filterByType(this)" class="nav-link-button badge">${allFeeds?.localFeeds[i].type}</span></span>
                  <span><span data-source="local" onclick="filterBySource(this)" class="nav-link-button badge">local</span></span>
                </div>
              </h5>

              <div class="d-flex align-items-center">
                <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                  <img class="rounded-circle card-icon" src="${allFeeds?.localFeeds[i].img ? allFeeds?.localFeeds[i].img : 'assets/img/defaultfeed.png'}">
                </div>
                <div class="ps-3">
                  <h6 class="feed-tile fw-bold">${allFeeds?.localFeeds[i].name}</h6>` +
                  (allFeeds?.localFeeds[i].github ?
                    `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${allFeeds?.localFeeds[i].github}" target="_blank">${allFeeds?.localFeeds[i].contributor}</a></div>` :
                    `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${allFeeds?.localFeeds[i].contributor}</div>`
                  ) +
                `</div>
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
                  <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${allFeeds?.localFeeds[i].name}', 'local')">Open</button>
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
    }
  } else {
    // <tr>
    //   <th></th>               <!-- icon -->
    //   <th>Type</th>           <!-- Type -->
    //   <th>Feed</th>           <!-- Name + Description + Source-->
    //   <th>Domain</th>         <!-- Domain -->
    //   <th>Tag(s)</th>         <!-- Tags -->
    //   <th>Contributor</th>    <!-- Contributor -->
    //   <th></th>               <!-- Action -->
    // </tr>

    var parent = $('#feeds-table-body');
    for (var i=0; i<allFeeds?.communityFeeds.length; i++) {
      // var contributor = await getUser(`https://api.github.com/users/${feeds?.communityFeeds[i].github}`);
      allFeeds['communityFeeds'][i]['source'] = 'community';
      var feed = `
      <tr>
        <td style="vertical-align: middle;"><img class="rounded-circle card-icon" src="${allFeeds?.communityFeeds[i].img}"></td>
        <td style="vertical-align: middle;">${allFeeds?.communityFeeds[i].type}</td>
        <td>
          <div class="feed-table-info">
            <h6 class="feed-tile fw-bold"><a href="https://github.com/solacecommunity/solace-event-feeds/tree/main/${allFeeds?.communityFeeds[i].name}" target="_blank">${allFeeds?.communityFeeds[i].name}</a> </h6>
            <div class="text-muted text-description small pt-2 ps-1">${allFeeds?.communityFeeds[i].description}</div>
            <div class="badge bg-dark">Community</div>
          </div>
        </td>
        <td>
          <div class="ps-3">
            <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
              allFeeds?.communityFeeds[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" class="badge bg-dark">${token.trim()}</div>`).join(' ')
            }</div>
          </div>
        </td>
        <td>
          <div class="ps-3">
            <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
              allFeeds?.communityFeeds[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" class="badge bg-dark">${token.trim()}</div>`).join(' ')
            }</div>
          </div>
        </td>
        <td>
          <div class="ps-3">` +
            (allFeeds?.communityFeeds[i].github ?
              `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${allFeeds?.communityFeeds[i].github}" target="_blank">${allFeeds?.communityFeeds[i].contributor}</a></div>` :
              `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${allFeeds?.communityFeeds[i].contributor}</div>`
            ) +
        `</div>
        </td>
        <td style="vertical-align: middle;">
          <div class="ps-3 d-flex align-right">
            <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${allFeeds?.communityFeeds[i].name}', 'community')">Open</button>
          </div>
        </td>
      </tr>
      `;
      parent.append( feed);
      feedsList.push(allFeeds?.communityFeeds[i]);
      data.push({source: 'community', id: shortHash(allFeeds?.communityFeeds[i].source + '::' + allFeeds?.communityFeeds[i].name + '::' + allFeeds?.communityFeeds[i].type + '::' + allFeeds?.communityFeeds[i].contributor),
                  ...allFeeds?.communityFeeds[i]});
    }

    if (isLocal) {
      for (var i=0; i<allFeeds?.localFeeds.length; i++) {
        // var contributor = await getUser(`https://api.github.com/users/${feeds?.communityFeeds[i].github}`);
        allFeeds['localFeeds'][i]['source'] = 'local';
        var feed = `
        <tr>
          <td style="vertical-align: middle;"><img class="rounded-circle card-icon" src="${allFeeds?.localFeeds[i].img}"></td>
          <td style="vertical-align: middle;">${allFeeds?.localFeeds[i].type}</td>
          <td>
            <div class="feed-table-info">
              <h6 class="feed-tile fw-bold">${allFeeds?.localFeeds[i].name}</h6>
              <div class="text-muted text-description small pt-2 ps-1">${allFeeds?.localFeeds[i].description}</div>
              <div class="badge bg-dark">Local</div>
            </div>
          </td>
          <td>
            <div class="ps-3">
              <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                allFeeds?.localFeeds[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" class="badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
            </div>
          </td>
          <td>
            <div class="ps-3">
              <div class="text-muted small pt-2 ps-1 fw-bold ">Tags: ${
                allFeeds?.localFeeds[i].tags.split(',').map(token => `<div data-tag="${token.trim()}" class="badge bg-dark">${token.trim()}</div>`).join(' ')
              }</div>
            </div>
          </td>
          <td>
            <div class="ps-3">` +
            (allFeeds?.localFeeds[i].github ?
              `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${allFeeds?.localFeeds[i].github}" target="_blank">${allFeeds?.localFeeds[i].contributor}</a></div>` :
              `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${allFeeds?.localFeeds[i].contributor}</div>`
            ) +
            `</div>
          </td>
          <td style="vertical-align: middle;">
            <div class="ps-3 d-flex align-right">
              <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${allFeeds?.localFeeds[i].name}', 'local')">Open</button>
            </div>
          </td>
        </tr>
        `;
        parent.append( feed);
        feedsList.push(allFeeds?.localFeeds[i]);
        data.push({source: 'community', id: shortHash(allFeeds?.localFeeds[i].source + '::' + allFeeds?.localFeeds[i].name + '::' + allFeeds?.localFeeds[i].type + '::' + allFeeds?.localFeeds[i].contributor),
                    ...allFeeds?.localFeeds[i]});
      }
    }

    $("#feedsTable").DataTable({
      language : {
          "zeroRecords": " "             
      },
      "paging": true,
      "searching": true,
      "ordering": true,
      "info": true,
      "responsive": true, 
      "lengthChange": false, 
      "autoWidth": false,
      "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    }).buttons().container().appendTo('.card-body #feedsTable_wrapper .col-md-6:eq(0)');
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
      console.log('I am here', data[i].name, data[i].source, data[i].type);

      var feed = `
      <div class="col-xl-4">
        <div class="card info-card customers-card">
          <div class="card-body cart-tile">
            <h5 class="card-title">
              <div class="d-flex align-center space-between">
              <span><span data-type="${data[i].type}" onclick="filterByType(this)" class="nav-link-button badge">${data[i].type}</span></span>
                <span><span data-source="local" onclick="filterBySource(this)" class="nav-link-button badge">local</span></span>
              </div>
            </h5>

            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img class="rounded-circle card-icon" src="${data[i].img ? data[i].img : 'assets/img/defaultfeed.png'}">
              </div>
              <div class="ps-3">
                <h6 class="feed-tile fw-bold">${data[i].name}</h6>` +
                (data[i].github ?
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${data[i].github}" target="_blank">${data[i].contributor}</a></div>` :
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${data[i].contributor}</div>`
                ) +
              `</div>
            </div>
            <div class="text-muted text-description small pt-2 ps-1">${data[i].description}</div>
            <div class="d-flex align-center space-between">
              <div class="ps-3">
                <div class="text-muted small pt-2 ps-1 fw-bold">Domain: ${
                  data[i].domain.split(',').map(token => `<div data-domain="${token.trim()}" onclick="filterByDomain(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ')
                }</div>
                <div class="text-muted small pt-2 ps-1 fw-bold ">Tags:` +
                    (localStorage.getItem('view') === 'grid' ?
                      data[i].tags.split(',').map(token => 
                        `<div data-tag="${token.trim()}" onclick="filterByTag(this)" class="nav-link-button badge bg-dark">${token.trim()}</div>`).join(' ') :
                      data[i].tags.split(',').map(token => 
                        `<div data-tag="${token.trim()}" class="badge bg-dark">${token.trim()}</div>`).join(' ')) +
                `</div>
              </div>
              <div class="ps-3 d-flex align-right">
                <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${data[i].name}', '${data[i].source}')">Open</button>
              </div>
            </div>

          </div>
        </div>
      </div>`
  
      parent.append( feed);
    }
  
  
  }

  _handleView = async (evt) => {
    var ids = [];
    const mode = evt.target.dataset.mode;
    localStorage.setItem('view', mode);
    window.location.reload();
  }

  _handleSort = async (evt) => {
    var ids = [];
    const mode = evt.target.dataset.mode;
    var data = feedsList
    if (mode === 'alphadown') {
      let btnX = document.getElementById('sort-alpha-up')
      btnX.classList.remove('active')
      let btn = document.getElementById('sort-alpha-down')
      btn.classList.add('active')
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (mode === 'alphaup') {
      let btnX = document.getElementById('sort-alpha-down')
      btnX.classList.remove('active')
      let btn = document.getElementById('sort-alpha-up')
      btn.classList.add('active')
      data.sort((a, b) => b.name.localeCompare(a.name));
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
  
    if (localStorage.getItem('view') === 'grid') {
      var searchInput = document.querySelector('.js-shuffle-search');
      const searchText = searchInput.value;

      if (searchText) {
        var results = feeds.idx.search(searchText.toLowerCase());
        results.forEach(function (result) {
          return feeds.db[result.ref]
        })
        ids = results.map(r => r.ref);
      } else {
        ids = feeds.documents.map(d => d.id);
      }
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
      <div class="col-xl-4">
        <div class="card info-card customers-card">
          <div class="card-body cart-tile">
            <h5 class="card-title">
              <div class="d-flex align-center space-between">
                <span data-type="${data[i].type}" onclick="filterByType(this)" class="nav-link-button badge">${data[i].type}</span>
                <span data-source="${data[i].source}" onclick="filterBySource(this)" class="nav-link-button badge">${data[i].source}</span>
              </div>
            </h5>
  
            <div class="d-flex align-items-center">
              <div class="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img class="rounded-circle card-icon" src="${data[i].img ? data[i].img : 'assets/img/defaultfeed.png'}">
              </div>
              <div class="ps-3">
                <h6 class="feed-tile fw-bold"><a href="${data[i].github}" target="_blank">${data[i].name}</a> </h6>` +
                (data[i].github ?
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span><a href="https://github.com/${data[i].github}" target="_blank">${data[i].contributor}</a></div>` :
                  `<div class="text-danger small pt-1 fw-bold"><span class="anon-contributor">Contributor: </span>${data[i].contributor}</div>`
                ) +
              `</div>
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
                <button type="button" class="btn btn-feeds-primary" onclick="openFeed('${data[i].name}', '${data[i].source}')">Open</button>
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

  // view change
  const viewFeed = document.querySelectorAll('.view-feed');
  viewFeed.forEach(el => el.addEventListener('click', _handleView));
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

document.addEventListener('DOMContentLoaded', async function () {
  var view = localStorage.getItem('view');
  if (!view) view = 'grid';
  localStorage.setItem('view', view);

  if (view === 'grid') {
    $('#feeds-table').css('display', 'none');
    // $('#feeds-grid').css('display', 'block');

    let btnX = document.getElementById('grid-view')
    btnX.classList.add('active')
    let btn = document.getElementById('table-view')
    btn.classList.remove('active')
  } else {
    $('#feeds-table').css('display', 'block');
    // $('#feeds-grid').css('display', 'none');

    let btnX = document.getElementById('table-view')
    btnX.classList.add('active')
    let btn = document.getElementById('grid-view')
    btn.classList.remove('active')
  }

  var els = $('.only-for-grid');
  for (i=0;i<els.length;i++) {
    if (view === 'table')
      els[i].style.display = 'none';
    else
      els[i].style.display = 'block';
  }
});