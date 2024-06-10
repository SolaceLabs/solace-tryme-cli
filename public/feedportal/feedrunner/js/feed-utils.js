function camelCaseToWords(s) {
  const result = s.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function isEmpty(val) {
  if (!val) return true;
  if (typeof val === 'string') return val.length === 0;
  if (typeof val === 'object') return (Object.keys(val).length === 0 && val.constructor === Object)
  return false;
}

function isEmptyText(textValue) {
  return (
    !textValue ||
    textValue.length() === 0
  )
}
function isObjectEmpty(objectName) {
  return (
    objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
