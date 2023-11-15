import { Logger } from '../utils/logger'
import { SempClient } from '../common/aclprofile-client'
import { displayHelpExamplesForAclProfile } from '../utils/examples'
import { checkSempAclProfileParamsExists, checkSempConnectionParamsExists } from '../utils/checkparams';
import { saveOrUpdateCommandSettings } from '../utils/config';

const invoke = async (
  options: ManageClientOptions
) => {
  const client = new SempClient(options);
  try {
    await client.manageAclProfile();
  } catch (error:any) {
    Logger.logDetailedError(`acl-profile ${options.operation?.toLocaleLowerCase()} failed with error`, `${error.toString()}`)
    if (error.cause?.message) Logger.logDetailedError(``, `${error.cause?.message}`)
    Logger.error('exiting...')
    process.exit(1)
  }

  Logger.logSuccess('exiting...')
  process.exit(0);
}

const aclProfile = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples, save } = options

  if (helpExamples) {
    displayHelpExamplesForAclProfile()
    process.exit(0);
  }

  // check semp connection params found
  checkSempConnectionParamsExists(options.sempUrl, options.sempVpn, options.sempUsername, options.sempPassword);

  // check semp acl-profile operation params
  checkSempAclProfileParamsExists(options, optionsSource);

  if (save) {
    saveOrUpdateCommandSettings(options, optionsSource)
    process.exit(0);
  }
  
  invoke(options)
}

export default aclProfile

export { aclProfile }
