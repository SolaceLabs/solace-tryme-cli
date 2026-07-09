import { SolaceClient } from '../common/browse-client'
import { displayHelpExamplesForBrowse } from '../utils/examples';
import { Logger } from '../utils/logger'
import { checkConnectionParamsExists, checkBrowseIntegrity } from '../utils/checkparams'
import { saveOrUpdateCommandSettings } from '../utils/config';

const browse = async (
  options: MessageClientOptions,
  optionsSource: any
) => {
  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  const browser = new SolaceClient(options);
  var interrupted = false;
  try {
    await browser.connect();
    browser.browse(options);
  } catch (error:any) {
    Logger.logError('exiting...')
    process.exit(1)
  }
  process.on('SIGINT', function () {
    'use strict';
    if (interrupted) return;
    interrupted = true;
    Logger.logInfo('operation interrupted...')
    browser.exit();
  });

  if (options.exitAfter) {
    setTimeout(function exit() {
      Logger.logWarn(`exiting session (exit-after set for ${options.exitAfter})...`);
      browser.exit();
    }, options.exitAfter * 1000);
  }

  process.stdin.resume();
}

const browser = (options: MessageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options

  if (helpExamples) {
    displayHelpExamplesForBrowse()
    process.exit(0);
  }

  // check connection params found
  checkConnectionParamsExists(options.url, options.vpn, options.username, options.password);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }

  // check browse params found
  checkBrowseIntegrity(options.queue);

  browse(options, optionsSource);
}

export default browser

export { browser }
