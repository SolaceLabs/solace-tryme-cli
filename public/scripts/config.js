var connection = {};

async function getEndpoints() {
  const response = await fetch(window.location.href + "config");
  const json = await response.json();
  console.log(json);
  connection = {
    ...json
  };
}
