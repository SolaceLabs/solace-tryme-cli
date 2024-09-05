/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/**
 * shorthash2 Jecsham (c) 2020
 * Based in shorthash (c) 2013 Bibig https://github.com/bibig/node-shorthash (MIT)
 */
const bitwise = (str:string) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash &= hash;
  }
  return hash;
};

const binaryTransfer = (intVal:any, binary:any) => {
  const dictionary = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  binary = binary || 62;
  let stack = [];
  let num;
  let result = '';
  const sign = intVal < 0 ? '-' : '';
  intVal = Math.abs(intVal);
  while (intVal >= binary) {
    num = intVal % binary;
    intVal = Math.floor(intVal / binary);
    stack.push(dictionary[num]);
  }
  if (intVal > 0) {
    stack.push(dictionary[intVal]);
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    result += stack[i];
  }
  return sign + result;
};

const shortHash = (text:string) => {
  const id = binaryTransfer(bitwise(String(text)), 61);
  return id.replace('-', 'z');
};

module.exports = shortHash;
