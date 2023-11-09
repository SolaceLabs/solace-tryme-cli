import { Logger } from '../utils/logger'
import { SempClient } from '../common/clientprofile-client'
import { displayHelpExamplesForClientProfile } from '../utils/examples'
import { checkSempClientProfileParamsExists, checkSempConnectionParamsExists } from '../utils/checkparams';
import { saveOrUpdateCommandSettings } from '../utils/config';

const invoke = async (
  options: ManageClientOptions
) => {
  const client = new SempClient(options);
  try {
    await client.manageClientProfile();
  } catch (error:any) {
    Logger.logDetailedError(`client-profile ${options.operation?.toLocaleLowerCase()} failed with error`, `${error.toString()}`)
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.error('exiting...')
    process.exit(1)
  }

  Logger.success('Exiting...')
  process.exit(0);
}

const clientProfile = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples, save, saveTo } = options

  if (helpExamples) {
    displayHelpExamplesForClientProfile()
    process.exit(0);
  }

  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp client-profile operation params
  checkSempClientProfileParamsExists(options);

  if (save || saveTo) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }
  
  invoke(options)
}

export default clientProfile

export { clientProfile }
