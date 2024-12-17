async function showSampleData() {
  // var page = window.location.href.split('/').pop();
  var page = window.location.href.split('#').pop();
  var messageName = decodeURIComponent(page.split('#').pop());
  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var rules = feed.rules.filter((r) => r.messageName === messageName);
  if (!rules) return;

  var ruleIndex = localStorage.getItem('currentRuleIndex');
  if (ruleIndex === null) ruleIndex = 0;
  var rule = rules[ruleIndex];

  var events = await generateEvents(rule, 5);
  var fakeData = [];
  for (var i=0; i<5; i++) {
    fakeData.push({
      topic: events[i].topic,
      payload: events[i].payload
    })
  }


  $('#copyToClipboard').click(async function writeDataToClipboard () {
    await navigator.clipboard.writeText(JSON.stringify(fakeData, null, 2));
    toastr.success('Copied to clipboard.')
  });
  $('#json-renderer').jsonViewer(fakeData);
  $('#sample_data_view').modal('toggle');
  console.log(fakeData);
}

async function showSampleApiData() {
  $("body").css("cursor", "progress");

  var feed = JSON.parse(localStorage.getItem('currentFeed'));
  var rules = feed.rules;
  if (!rules) return;

  var events = await generateApiEvents(feed, 5);
  var fakeData = [];
  for (var i=0; i<5; i++) {
    fakeData.push({
      topic: events[i].topic,
      payload: events[i].payload
    })
  }


  $('#copyToClipboard').click(async function writeDataToClipboard () {
    await navigator.clipboard.writeText(JSON.stringify(fakeData, null, 2));
    toastr.success('Copied to clipboard.')
  });
  $('#json-renderer').jsonViewer(fakeData);
  $('#sample_data_view').modal('toggle');
  console.log(fakeData);

  $("body").css("cursor", "default");

}
