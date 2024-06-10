/* eslint-disable prefer-const */
/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
/* eslint-disable no-plusplus */
/**
 * shorthash2 Jecsham (c) 2020
 * Based in shorthash (c) 2013 Bibig https://github.com/bibig/node-shorthash (MIT)
 */
const bitwise = (str) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash &= hash;
  }
  return hash;
};

const binaryTransfer = (integer, binary) => {
  const dictionary = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  binary = binary || 62;
  let stack = [];
  let num;
  let result = '';
  const sign = integer < 0 ? '-' : '';
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    stack.push(dictionary[num]);
  }
  if (integer > 0) {
    stack.push(dictionary[integer]);
  }
  for (let i = stack.length - 1; i >= 0; i--) {
    result += stack[i];
  }
  return sign + result;
};

const shortHash = (text) => {
  const id = binaryTransfer(bitwise(String(text)), 61);
  return id.replace('-', 'z');
};