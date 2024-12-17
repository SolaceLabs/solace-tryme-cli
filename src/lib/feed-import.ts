import * as fs from 'fs'
import path from "path";
import { Logger } from '../utils/logger'
import { chalkBoldWhite } from '../utils/chalkUtils'
import { fileExists, processPlainPath } from '../utils/config';
import { defaultStmFeedsHome } from '../utils/defaults';

const feedImport = async (options: ManageFeedClientOptions, optionsSource: any) => {
  var archiveFile = optionsSource.archiveFile === 'cli' ? options.archiveFile : '';

  if (!archiveFile) {
    const { Input } = require('enquirer');
    const pFilename = new Input({
      message: 'Feed Archive file',
      initial: 'feed-export.zip',
      validate: (value: string) => {  return !!value; }
    });
    
    await pFilename.run()
      .then((answer:any) => archiveFile = answer)
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });
  }

  archiveFile = archiveFile.trim().replace(/['"]+/g, '');
  let zipPath = !fileExists(archiveFile) ? `${process.cwd()}/${archiveFile}` : archiveFile;
  if (!fileExists(zipPath)) {
    Logger.logError(`File ${archiveFile} does not exist!`);
    Logger.error('exiting...');
    process.exit(1);
  }

  const feedsPath = processPlainPath(`${defaultStmFeedsHome}`);
  if (!fileExists(feedsPath)) {
    Logger.error('Local feeds folder does not exist, something wrong!');
    process.exit(1)
  }

  var importPath = `${process.cwd()}/import`;
  if (fileExists(importPath)) fs.rmdirSync(importPath, { recursive: true });
  fs.mkdirSync(importPath, { recursive: true });

  // unzip the archive file
  const zlib = require("zip-lib");
  await zlib.extract(zipPath, importPath).then(function () {
    console.log("done");
  }, function (err:any) {
    fs.rmdirSync(importPath, { recursive: true });
    Logger.logDetailedError('feed import failed...', err)
    Logger.error('exiting...');
    process.exit(1);
  });

  const files:any = fs.readdirSync(`${importPath}`);
  const feedName = files[0];

  const localFeedPath = processPlainPath(`${feedsPath}/${feedName}`);
  if (fileExists(localFeedPath)) {
    const { Confirm } = require('enquirer');

    const pFeedOverwrite = new Confirm({
      message: chalkBoldWhite(`A feed by name ${feedName} already exists, do you want to overwrite it?`)
    });
    
    await pFeedOverwrite.run()
      .then((answer:any) => {
        if (!answer) {
          Logger.success('exiting...');
          process.exit(1)
        }
      })
      .catch((error:any) => {
        Logger.logDetailedError('interrupted...', error)
        process.exit(1);
      });  

      fs.rmSync(localFeedPath, { recursive: true, force: true });
  }

  await moveFiles(`${importPath}/${feedName}`, localFeedPath);
  fs.rmSync(importPath, { recursive: true, force: true });

  Logger.success(`Feed ${feedName} imported successfully!`);
  Logger.success('exiting...');
  process.exit(0);

}

const moveFiles = async (sourceDir: string, targetDir: string) => {
  if (!fileExists(targetDir))
    fs.mkdirSync(targetDir, { recursive: true });

  const files:any = fs.readdirSync(`${sourceDir}`);
  files.forEach((file: string) => {
    fs.copyFileSync(`${sourceDir}/${file}`, `${targetDir}/${file}`);
  });
}


export default feedImport;