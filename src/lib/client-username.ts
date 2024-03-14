import { Logger } from '../utils/logger'
import { SempClient } from '../common/clientusername-client'
import { displayHelpExamplesForClientUsername } from '../utils/examples'
import { checkSempClientUsernameParamsExists, checkSempConnectionParamsExists } from '../utils/checkparams';
import { saveOrUpdateCommandSettings } from '../utils/config';

const invoke = async (
  options: ManageClientOptions
) => {
  const client = new SempClient(options);
  try {
    await client.manageClientUsername();
  } catch (error:any) {
    Logger.logDetailedError(`client-username ${options.operation?.toLocaleLowerCase()} failed with error`, `${error.toString()}`)
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.error('exiting...')
    process.exit(1)
  }

  Logger.logSuccess('exiting...')
  process.exit(0);
}

const clientUsername = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options

  if (helpExamples) {
    displayHelpExamplesForClientUsername()
    process.exit(0);
  }

  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp client-username operation params
  checkSempClientUsernameParamsExists(options, optionsSource);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }
  
  // if a direct cli execution without reference to named command, reset all default options (except semp parameters)
  if (options.update) {
    const noReset = [ "command", "clientUsername" ];

    Object.keys(options).forEach((option) => {
      if (!option.startsWith('semp') && !noReset.includes(option)) {
        if (optionsSource[option] !== 'cli')
          options[option] = undefined;
      }
    })
  }

  invoke(options)
}

export default clientUsername

export { clientUsername }
