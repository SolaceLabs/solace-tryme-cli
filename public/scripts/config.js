var connection = {};

async function getEndpoints() {
  console.log('CURRENT URL', window.location.href);
  const response = await fetch(window.location.href + "config");
  const json = await response.json();
  console.log(json);
  connection = {
    ...json
  };
}
