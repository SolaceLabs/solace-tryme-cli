#!/usr/bin/env node
const { Commander } = require('..')
const chalk = require('chalk')
const process = require('node:process');
process.noDeprecation = true

const getHelpConfiguration = (args) => {
  if (args.indexOf('stm config init') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm config delete') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm config list') >= 0)
    return { help: true, helpMore: false, helpExamples: true}
  if (args.indexOf('stm send') >= 0)
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
  if (args.indexOf('stm manage connection') >= 0)
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
  const rootHelp = (process.argv.length === 2) || process.argv.includes('help') ? true : false
  if (rootHelp || helpMore) process.argv.push('-h')
  
  console.log("")
  console.log(chalk.hex('#00c895').bold("█████╗ █████╗ ██╗    ████╗  ████╗████╗  ████████╗█████╗ ██╗   ██╗    ███╗  ███╗█████╗"))
  console.log(chalk.hex('#00c895').bold("█╔═══╝██╔══██╗██║   ██╔═██╗██╔══╝██══╝  ╚══██╔══╝██╔═██╗╚██╗ ██╔╝    ████╗ ███║██╔══╝"))
  console.log(chalk.hex('#00c895').bold("█████╗██║  ██║██║   ██████║██║   ███╗      ██║   █████╔╝ ╚████╔╝     ██╔███╔██║███╗  "))
  console.log(chalk.hex('#00c895').bold("╚══██║██║  ██║██║   ██╔═██║██║   ██╔╝      ██║   ██╔═██╗  ╚██╔╝ ███  ██║╚██╝██║██╔╝  "))
  console.log(chalk.hex('#00c895').bold("█████║╚█████╔╝█████╗██║ ██║╚████╗████╗     ██║   ██║ ██║   ██║       ██║ ╚╝ ██║█████╗"))
  console.log(chalk.hex('#00c895').bold("╚════╝ ╚════╝ ╚════╝╚═╝ ╚═╝ ╚═══╝╚═══╝     ╚═╝   ╚═╝ ╚═╝   ╚═╝       ╚═╝    ╚═╝╚════╝"))
  console.log("")

  commander.init();
  commander.program.parse(process.argv)
} catch (e) {
  console.log(e)
}
