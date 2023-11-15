import { saveOrUpdateCommandSettings } from '../utils/config';
import { displayHelpExamplesForSempConnection } from '../utils/examples';
import { Logger } from '../utils/logger';

const sempConnection = (options: ManageClientOptions, optionsSource: any) => {
  const { helpExamples } = options

  if (helpExamples) {
    displayHelpExamplesForSempConnection()
    process.exit(0);
  }

  var count = 0;
  Object.keys(optionsSource).forEach(key => count += optionsSource[key] === 'cli' ? 1 : 0)
  if (!count) {
    Logger.error('specify at least one or more parameters')
    Logger.error('exiting...')
    process.exit(1)
  }

  saveOrUpdateCommandSettings(options, optionsSource)
  process.exit(0);
}

export default sempConnection

export { sempConnection }
