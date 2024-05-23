async function generateEvents(rule, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(rule, count);
  const response = await fetch(path + `/fakeevent`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ rule, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  console.log(result);
  return result;
}

async function generateRuleBasedValue(rule, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(rule, count);
  const response = await fetch(path + `/fakedata`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ rule, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  // console.log(result);
  return result;
}

async function generateRuleBasedPayload(payload, count) {
  const path = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
  // console.log(payload, count);
  const response = await fetch(path + `/fakepayload`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ payload, count })
  });

  const result = await response.json();
  if (response.status !== 200) {
    $('#sampleDataError').text(result.error);
    return;
  }

  $('#sampleDataError').text('');
  // console.log(result);
  return result;
}