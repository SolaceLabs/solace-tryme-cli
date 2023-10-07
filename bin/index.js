#!/usr/bin/env node
const solace = require('solclientjs').debug; // logging supported
const { Commander } = require('..')
const { splitSpacesExcludeQuotes } = require('quoted-string-space-split')
const cmd = 'XX XX pub -h localhost -p 1883 -t "hello/world" -m "Hello World from COMMANDER"'
const cmdArgv = splitSpacesExcludeQuotes(cmd);

try {
  const help = process.argv.includes('-h') || process.argv.includes('--help')
  const aHelp = process.argv.includes('-ah') || process.argv.includes('--advanced-help')
  const commander = new Commander(help, aHelp)
  const aHelpIndex1 = process.argv.indexOf('-ah')
  if (aHelpIndex1 >= 0) process.argv.splice(aHelpIndex1, 1, '-h');
  const aHelpIndex2 = process.argv.indexOf('--advanced-help')
  if (aHelpIndex2 >= 0) process.argv.splice(aHelpIndex1, 1, '--help');

  commander.init();
  commander.program.parse(process.argv)
} catch (e) {
  console.log(e)
}
