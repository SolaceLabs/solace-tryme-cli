'use strict';

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

// For non-es2015 usage
export {
  prettifyXml
}