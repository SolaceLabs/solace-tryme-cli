#!/usr/bin/env node
const { Commander } = require('..')

try {
  const help = process.argv.includes('-h') || process.argv.includes('--help')
  const moreHelp = process.argv.includes('-hm') || process.argv.includes('--help-more')
  const commander = new Commander(help, moreHelp)
  const moreHelpIndex1 = process.argv.indexOf('-hm')
  if (moreHelpIndex1 >= 0) process.argv.splice(moreHelpIndex1, 1, '-h');
  const moreHelpIndex2 = process.argv.indexOf('--help-more')
  if (moreHelpIndex2 >= 0) process.argv.splice(moreHelpIndex1, 1, '--help');

  commander.init();
  commander.program.parse(process.argv)
} catch (e) {
  console.log(e)
}
