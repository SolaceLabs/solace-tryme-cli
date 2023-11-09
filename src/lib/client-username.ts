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

  Logger.success('Exiting...')
  process.exit(0);
}

const clientUsername = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples, save, saveTo } = options

  if (helpExamples) {
    displayHelpExamplesForClientUsername()
    process.exit(0);
  }

  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp client-username operation params
  checkSempClientUsernameParamsExists(options);

  if (save || saveTo) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }
  
  invoke(options)
}

export default clientUsername

export { clientUsername }
