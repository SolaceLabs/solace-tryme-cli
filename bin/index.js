#!/usr/bin/env node
const { Commander } = require('..')
// suppress ExperimentalWarning emitted by fetch()
// https://github.com/nodejs/node/issues/30810#issuecomment-1433950987
const { emit: originalEmit } = process;
process.emit = (event, error) => event === 'warning' && error.name === 'ExperimentalWarning' ? false : originalEmit.apply(process, arguments);

const getHelpConfiguration = (args) => {
  if (args.indexOf('stm config init') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm config delete') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm config view') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm config list') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm publish') >= 0)
  return { help: true, helpMore: true, helpExamples: true}
    if (args.indexOf('stm receive') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm request') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm reply') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm manage queue') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm manage client-profile') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm manage acl-profile') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm manage client-username') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm manage vpn-connection') >= 0)
    return { help: true, helpMore: true, helpExamples: true}
  if (args.indexOf('stm manage semp-connection') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  return { help: true, helpMore: false, helpExamples: false}
}

try {
  const help = process.argv.includes('-h') || process.argv.includes('--help')
  const helpMore = process.argv.includes('-hm') || process.argv.includes('--help-more')
  const commander = new Commander(help, helpMore)
  const helpConfig = getHelpConfiguration(process.argv.join(' '))
  if (helpConfig.helpMore && helpMore) process.argv.push('-h')

  commander.init();
  commander.program.parse(process.argv)
} catch (e) {
  console.log(e)
}
