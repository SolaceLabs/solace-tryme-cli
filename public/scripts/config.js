var connection = {};

async function getEndpoints() {
  const response = await fetch("/config");
  const json = await response.json();
  console.log(json);
  connection = {
    ...json
  };
}
