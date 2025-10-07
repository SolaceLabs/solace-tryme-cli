import parser, { AsyncAPIDocumentInterface, Input, Parser } from '@asyncapi/parser';
import { Logger } from '../utils/logger'
import { readAsyncAPIFile } from '../utils/config';
import { chalkBoldError, chalkBoldWarning } from '../utils/chalkUtils';

const validate = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var fileName = undefined;

  if (optionsSource.fileName === 'cli') fileName = options.fileName;

  if (!fileName) {
    const { Input } = require('enquirer');
    const pFilename = new Input({
      message: 'Enter AsyncAPI file',
      validate: (value: string) => {  return !!value; }
    });
    
    await pFilename.run()
      .then((answer:any) => fileName = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  if (options.lint) {
    Logger.logSuccess('linting successful...')
    process.exit(0);
  }

  const asyncApiSchema = readAsyncAPIFile(fileName!);
  await validateAsyncAPI(asyncApiSchema);
}

const validateAsyncAPI = async (asyncApiSchema: Input) => {
  const parser = new Parser();
  Logger.await('Validating AsyncAPI document...');
  const diagnostics = await parser.validate(asyncApiSchema);
  let errors:number = 0;
  let warns:number = 0;
  Array.from(diagnostics).forEach((issue) => {
    if (issue.severity === 0)
      errors++, Logger.error(chalkBoldError(issue.message));
    else if (issue.severity == 1) 
      warns++, Logger.warn(chalkBoldWarning(issue.message));
  })

  if (errors+warns > 0) {
    if (errors)
      Logger.logDetailedError('Validation Status', `Encountered ${warns ? warns + ' warnings' + (errors ? ', ' : '') : ''} ${errors? errors + ' errors' : ''} `);
    else
      Logger.logDetailedWarn('Validation Status', `Encountered ${warns ? warns + ' warnings' + (errors ? ', ' : '') : ''} ${errors? errors + ' errors' : ''} `);
  }

  if (errors) {
    Logger.error('AsyncAPI document validation failed');
    Logger.error('exiting...');
    process.exit(1);
  } else {
    Logger.success('AsyncAPI document validated successfully');
  }
}

export { validate as feedValidate, validateAsyncAPI }