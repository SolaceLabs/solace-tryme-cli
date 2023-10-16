#!/usr/bin/env node
const { Commander } = require('..')

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
