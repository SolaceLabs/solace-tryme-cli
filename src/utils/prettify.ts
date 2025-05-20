'use strict';

import { prettyPrint } from '@base2/pretty-print-object';
import { Logger } from './logger';
import chalk from 'chalk';
var _os = require('os');

var stringTimesN = function stringTimesN(n:number, char:string) {
  return Array(n + 1).join(char);
};

// Adapted from https://gist.github.com/sente/1083506
function prettifyXml(xmlInput:string, options: any) {
  var _options$indent = options.indent,
      indentOption = _options$indent === undefined ? 2 : _options$indent,
      _options$newline = options.newline,
      newlineOption = _options$newline === undefined ? _os.EOL : _options$newline;

  var indentString = stringTimesN(indentOption, ' ');

  var formatted = '';
  var regex = /(>)\s*(<)(\/*)/g;
  var xml = xmlInput.replace(regex, '$1' + newlineOption + '$2$3');

  var pad = 0;
  xml.split(/\r?\n/).forEach(function (l:any) {
    var line = l.trim();

    var indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      // Somehow istanbul doesn't see the else case as covered, although it is. Skip it.
      /* istanbul ignore else  */
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (line.match(/^<\w([^>]*[^\/])?>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    var padding = stringTimesN(pad, indentString);
    formatted += padding + line + newlineOption; // eslint-disable-line prefer-template
    pad += indent;
  });

  return formatted.trim();
}

function prettyXML(str: string, indent: number) {
  if (!str) return str;
  if (str.trim().startsWith('<')) {
    var result = prettifyXml(str, {indent: indent, newline: '\n'});
    return result;
  } else {
    // Logger.warn(`not a valid xml payload`)
    return str;
  }
}

function prettyJSON(str: string) {
  if (!str) return str;
  try {
    let isNum = /^\d+$/.test(str);

      var obj = isNum ? str : JSON.parse(str);
      // var output = chalk.green(JSON.stringify(obj, null, 2));
      // return prettyPrint(obj, {
      //   indent: '  ',
      //   singleQuotes: false
      // });
      var output = colorizeJSON(obj, 2);
      return output
  } catch (error: any) {
    // Logger.warn(`not a valid json payload`)
    return str;
  }
}

function colorizeJSON(json: any, indent = 2) {
  const stringified = JSON.stringify(json, null, indent);
  return stringified.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = chalk.magentaBright;
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = chalk.cyanBright;
      } else {
        cls = chalk.greenBright;
      }
    } else if (/true|false/.test(match)) {
      cls = chalk.yellow;
    } else if (/null/.test(match)) {
      cls = chalk.redBright;
    }
    return cls(match);
  });
}


function padString(lPad: number, str: string, length: number) {
  if (str.length >= length) return str;
  const leftPadded = stringTimesN(lPad, ' ') + str;
  const totalPadding = length - leftPadded.length;
  const rightPadded = leftPadded + stringTimesN(totalPadding, ' ');
  return rightPadded;
}

// For non-es2015 usage
export {
  prettyXML,
  prettyJSON,
  prettifyXml,
  padString
}