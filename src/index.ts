import 'core-js'
import { Command } from 'commander'
import { version } from '../package.json'
import { defaultMessageConnectionConfig, defaultManageConnectionConfig, defaultFeedConfig } from './utils/defaults';
import { deleteConfig, initializeConfig, listConfig } from './utils/init'


import { addManageConnectionOptions, addManageSempConnectionOptions, 
        addConfigInitOptions, addConfigListOptions, addConfigDeleteOptions,
        addReceiveOptions, addRequestOptions,  addReplyOptions, 
        addManageQueueOptions, addManageAclProfileOptions, addManageClientProfileOptions, addManageClientUsernameOptions, 
        addVisualizeOptions, addVisualizeLaunchOptions, addSendOptions, addRootHelpOptions, addConfigHelpOptions, 
        addManageHelpOptions, addFeedPreviewOptions, addFeedGenerateOptions, addFeedConfigureOptions,
        addFeedRunOptions, addFeedListOptions, addFeedContributeOptions, addFeedImportOptions, addFeedValidateOptions, 
        addFeedDownloadOptions, addFeedExportOptions
} from './utils/options';
import publisher from './lib/publish';
import receiver from './lib/receive';
import requestor from './lib/request';
import replier from './lib/reply';
import queue from './lib/queue';
import clientProfile from './lib/client-profile';
import aclProfile from './lib/acl-profile';
import clientUsername from './lib/client-username';
import connection from './lib/connection';
import visualize from './utils/visualize';
import { ManageClientOptionsEmpty, ManageFeedClientOptionsEmpty, MessageClientOptionsEmpty } from './utils/instances';
import { getLastVersionCheck, loadCommandFromConfig, updateLastVersionCheck } from './utils/config';
import sempConnection from './lib/semp-connection';
import chalk from 'chalk';
import { displayConfigHelpExamples, displayFeedConfigHelpExamples, displayManageHelpExamples, displayRootHelpExamples } from './utils/examples';
import feedPreview from './lib/feed-preview';
import feedGenerate from './lib/feed-generate';
import feedConfigure from './lib/feed-configure';
import feedRun from './lib/feed-run'
import feedContribute from './lib/feed-contribute';
import feedList from './lib/feed-list';
import feedImport from './lib/feed-import';
import feedExport from './lib/feed-export';
import feedDownload from './lib/feed-archive';
import { Logger } from './utils/logger';
import { chalkBoldWhite } from './utils/chalkUtils';
import feedPortal from './lib/feed-portal';
import { feedValidate } from './lib/feed-validate';

export class Commander {
  program: Command
  help: boolean
  advanced: boolean
  online: boolean
  newVersionFound: boolean
  lastChecked: number|undefined
  version: string

  constructor(help: boolean, advanced: boolean) {
    this.program = new Command()
    this.help = help;
    this.advanced = advanced;
    this.online = true;
    this.version = version
    this.newVersionFound = false;
    this.lastChecked = getLastVersionCheck();
  }

  getVersion() {
    this.newVersionCheck();
    return `Current Version: v${this.version}`;
  }

  newVersionCheck(): string {
    if (!this.online) 
      return '';

    var now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 1 day
    // const oneDay = 10 * 1000; // 10 secs

    if (!this.newVersionFound && this.lastChecked && (now - this.lastChecked) > oneDay) {
      const fetch = require('sync-fetch')
      var latestVersion = undefined;

      try {
        latestVersion = fetch('https://api.github.com/repos/SolaceLabs/solace-tryme-cli/releases/latest', {
          headers: {
            Accept: 'application/json'
          }
        }).json()
      } catch (error) {
        this.online = false;
      }

      if (latestVersion && this.online) {
        if (`${'v' + this.version}` !== latestVersion.name) {
          Logger.info(`new version available: ${latestVersion.name}, current version: ${this.version}`)
          Logger.alert(`Download URL: ${latestVersion.html_url}\n`);
        }

        updateLastVersionCheck(now)
        this.newVersionFound = true;
      }
    }

    return '';
  }

  init(): void {
    const rootCmd = this.program
      .name('stm')
      .description(chalk.whiteBright('A Solace Try-Me client for the command line'))
      .enablePositionalOptions()
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
      .version(this.getVersion(), '-v, --version')
    addRootHelpOptions(rootCmd);
    rootCmd.action((options) => {
      this.newVersionCheck();
      if (options.helpExamples) 
        displayRootHelpExamples();
      else {
        if (rootCmd.args.length)
          Logger.error(`Unknown command ${chalkBoldWhite(rootCmd.args.join(' '))}`);

        rootCmd.help();
      }
    });
      
    // stm send
    const sendCmd = this.program
      .command('send')
      .description(chalk.whiteBright('Execute a send command'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addSendOptions(sendCmd, this.advanced);
    sendCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('send'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = sendCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('send', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }

      if (options.deliveryMode === 'PERSISTENT') {
        cliOptions.guaranteedPublisher = 'implied';
        options.guaranteedPublisher = true;
      }

      publisher(options, cliOptions);
    })
  
    // stm receive
    const receiveCmd = this.program
      .command('receive')
      .description(chalk.whiteBright('Execute a receive command'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())

    addReceiveOptions(receiveCmd, this.advanced);
    receiveCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('receive'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = receiveCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('receive', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }

      receiver(options, cliOptions);
    })

    // stm request
    const requestCmd = this.program
      .command('request')
      .description(chalk.whiteBright('Execute a request command'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addRequestOptions(requestCmd, this.advanced);
    requestCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('request'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = requestCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('request', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
      requestor(options, cliOptions);
    })

    // stm reply
    const replyCmd = this.program
      .command('reply')
      .description(chalk.whiteBright('Execute a reply command'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addReplyOptions(replyCmd, this.advanced);
    replyCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('reply'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = replyCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('reply', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      replier(options, cliOptions);
    })

if (process.env.SHOW_VISUALIZATION) {
    // stm visualize
    const visualizeCmd = this.program
      .command('visualize')
      .description(chalk.whiteBright('Visualize event flow'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())

    // stm visualize on
    const visualizeOnCmd = visualizeCmd
      .command('on')
      .description(chalk.whiteBright('Turn on visualization'))
      .allowUnknownOption(false)          
    addVisualizeOptions(visualizeOnCmd, this.advanced);
    visualizeOnCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('connection'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = visualizeOnCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('connection', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = cliOptions[defaultKeys[i]] === 'cli' ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
      options['command'] = 'connection';
      options['visualization'] = 'on';
      cliOptions['visualization'] = 'cli';
  
      connection(options, cliOptions);
    })

    // stm visualization off
    const visualizeOffCmd = visualizeCmd
      .command('off')
      .description(chalk.whiteBright('Turn off visualization'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addVisualizeOptions(visualizeOffCmd, this.advanced);
    visualizeOffCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('connection'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = visualizeOffCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('connection', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = cliOptions[defaultKeys[i]] === 'cli' ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
      options['command'] = 'connection';
      options['visualization'] = 'off';
      cliOptions['visualization'] = 'cli';
  
      connection(options, cliOptions);
    })

    // stm visualization launch
    const visualizeLaunchCmd = visualizeCmd
      .command('launch')
      .description(chalk.whiteBright('Launch visualization'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addVisualizeLaunchOptions(visualizeLaunchCmd, this.advanced)
    visualizeLaunchCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      visualize(options);
    })
}

    // stm config
    const configCmd = this.program
      .command('config')
      .description(chalk.whiteBright('Manage command configurations'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    configCmd.action((options) => {
      this.newVersionCheck();
      if (options.helpExamples) 
        displayConfigHelpExamples();
      else 
        configCmd.help();
    });
    addConfigHelpOptions(configCmd);

    // stm config init
    const configInitCmd = configCmd
      .command('init')
      .description(chalk.whiteBright('Initialize command samples'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addConfigInitOptions(configInitCmd, this.advanced)
    
    configInitCmd.action((options: MessageInitOptions) => {
      this.newVersionCheck();
      const optionsSource:any = {};
      const defaultMessageKeys = Object.keys(defaultMessageConnectionConfig);
      for (var i=0; i<defaultMessageKeys.length; i++) {
        optionsSource[defaultMessageKeys[i]] = configInitCmd.getOptionValueSource(defaultMessageKeys[i]);
      }
  
      const defaultManageKeys = Object.keys(defaultManageConnectionConfig);
      for (var i=0; i<defaultManageKeys.length; i++) {
        optionsSource[defaultManageKeys[i]] = configInitCmd.getOptionValueSource(defaultManageKeys[i]);
      }

      initializeConfig(options, optionsSource);
    })

    // stm config list
    const configListCmd = configCmd
      .command('list')
      .description(chalk.whiteBright('List command samples'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addConfigListOptions(configListCmd, this.advanced)

    configListCmd.action((options: MessageInitOptions) => {
      this.newVersionCheck();
      const optionsSource:any = {};
      const defaultKeys = Object.keys(defaultMessageConnectionConfig);
      for (var i=0; i<defaultKeys.length; i++) {
        optionsSource[defaultKeys[i]] = configListCmd.getOptionValueSource(defaultKeys[i]);
      }

      listConfig(options, optionsSource);
    })

    // stm config delete
    const configDeleteCmd = configCmd
      .command('delete')
      .description(chalk.whiteBright('Delete command sample'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addConfigDeleteOptions(configDeleteCmd, this.advanced)
    configDeleteCmd.action((options: MessageInitOptions) => {
      this.newVersionCheck();
      const optionsSource:any = {};
      const defaultKeys = Object.keys(defaultMessageConnectionConfig);
      for (var i=0; i<defaultKeys.length; i++) {
        optionsSource[defaultKeys[i]] = configDeleteCmd.getOptionValueSource(defaultKeys[i]);
      }

      deleteConfig(options, optionsSource);
    })

    // stm manage
    const manageCmd = this.program
      .command('manage')
      .description(chalk.whiteBright('Manage broker connection and resources'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    manageCmd.action((options) => {
      this.newVersionCheck();
      if (options.helpExamples) 
        displayManageHelpExamples();
      else 
        manageCmd.help();
    });
    addManageHelpOptions(manageCmd);

    // stm manage vpn connection
    const manageConnectionCmd = manageCmd
      .command('connection')
      .description(chalk.whiteBright('Manage message VPN connection'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageConnectionOptions(manageConnectionCmd, this.advanced);
    manageConnectionCmd.action((options: MessageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('connection'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageConnectionCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('connection', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = cliOptions[defaultKeys[i]] === 'cli' ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      connection(options, cliOptions);
    })

    // stm manage semp connection
    const manageSempConnectionCmd = manageCmd
      .command('semp-connection')
      .description(chalk.whiteBright('Manage SEMP connection'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageSempConnectionOptions(manageSempConnectionCmd, this.advanced);
    manageSempConnectionCmd.action((options: ManageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('sempconnection'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageSempConnectionCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('sempconnection', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = cliOptions[defaultKeys[i]] === 'cli' ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      sempConnection(options, cliOptions);
    })

    // stm manage queue
    const manageQueueCmd = manageCmd
      .command('queue')
      .description(chalk.whiteBright('Manage a queue'))
      .argument('[operation]', 'queue operation: create, update, delete, or list')
      .argument('[queueName]', 'queue name')
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageQueueOptions(manageQueueCmd, this.advanced);
    manageQueueCmd.action((operation: string | undefined, queueName: string | undefined, options: ManageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('queue'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageQueueCmd.getOptionValueSource(defaultKeys[i]);
      }

      // Handle positional arguments for operation and queue name BEFORE loading config
      // so that positional arguments are not overridden by config values
      if (operation) {
        const validOperations = ['create', 'update', 'delete', 'list'];
        if (validOperations.includes(operation.toLowerCase())) {
          // Map positional operation to the appropriate option
          options[operation.toLowerCase()] = queueName || true;
          cliOptions[operation.toLowerCase()] = 'cli';
          if (operation.toLowerCase() === 'create') {
            options.owner = options.owner || 'default';
            cliOptions.owner = cliOptions.owner || 'implied';
          }
        }
      }

      const configOptions = loadCommandFromConfig('queue', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }

      queue(options, cliOptions);
    })

    // stm manage client-profile
    const manageClientProfileCmd = manageCmd
      .command('client-profile')
      .description(chalk.whiteBright('Manage a client-profile'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageClientProfileOptions(manageClientProfileCmd, this.advanced);
    manageClientProfileCmd.action((options: ManageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('client-profile'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageClientProfileCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('client-profile', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      clientProfile(options, cliOptions);
    })

    // stm manage acl profile
    const manageAclProfileCmd = manageCmd
      .command('acl-profile')
      .description(chalk.whiteBright('Manage a acl-profile'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageAclProfileOptions(manageAclProfileCmd, this.advanced);
    manageAclProfileCmd.action((options: ManageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('acl-profile'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageAclProfileCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('acl-profile', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      aclProfile(options, cliOptions);
    })

    // stm manage client username
    const manageClientUsernameCmd = manageCmd
      .command('client-username')
      .description(chalk.whiteBright('Manage a client username'))
      .allowUnknownOption(false)
      .addHelpText('after', this.newVersionCheck())
    addManageClientUsernameOptions(manageClientUsernameCmd, this.advanced);
    manageClientUsernameCmd.action((options: ManageClientOptions) => {
      this.newVersionCheck();
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('client-username'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageClientUsernameCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('client-username', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(cliOptions[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }
  
      clientUsername(options, cliOptions);
    })

    // stm feed
    const feedCmd = this.program
      .command('feed')
      .description(chalk.whiteBright('Manage event feeds'))
      .allowUnknownOption(false);

    // stm feed validate
    const feedValidateCmd = feedCmd
      .command('validate', { hidden: true })
      .description(chalk.whiteBright('Validate an AsyncAPI document'))
      .allowUnknownOption(false)
    addFeedValidateOptions(feedValidateCmd, this.advanced)

    feedValidateCmd.action((options: ManageFeedClientOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedValidateCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedValidate(options, optionsSource);
    })


    // stm feed preview
    const feedPreviewCmd = feedCmd
      .command('preview')
      .description(chalk.whiteBright('Preview an AsyncAPI document'))
      .allowUnknownOption(false)
    addFeedPreviewOptions(feedPreviewCmd, this.advanced)

    feedPreviewCmd.action((options: ManageFeedClientOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedPreviewCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedPreview(options, optionsSource);
    })

    // stm feed generate
    const generateCmd = feedCmd
      .command('generate')
      .description(chalk.whiteBright('Generate event feed from an AsyncAPI document'))
      .allowUnknownOption(false)
    addFeedGenerateOptions(generateCmd, this.advanced);
    generateCmd.action((options: ManageFeedClientOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = generateCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedGenerate(options, optionsSource);
    })

    // stm feed configure
    const configureCmd = feedCmd
      .command('configure')
      .description(chalk.whiteBright('Configure event feed rules'))
      .allowUnknownOption(false)
    addFeedConfigureOptions(configureCmd, this.advanced);
    configureCmd.action((options: ManageFeedClientOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = configureCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedConfigure(options, optionsSource);
    })

    // stm feed run
    const feedRunCmd = feedCmd
      .command('run')
      .description(chalk.whiteBright('Run event feed'))
      .allowUnknownOption(false)
    addFeedRunOptions(feedRunCmd, this.advanced);
    feedRunCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedRunCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      const defaultKeys = Object.keys(new MessageClientOptionsEmpty('send'));
      for (var i=0; i<defaultKeys.length; i++) {
        optionsSource[defaultKeys[i]] = feedRunCmd.getOptionValueSource(defaultKeys[i]);
      }
      const configOptions = loadCommandFromConfig('send', options)
      if (configOptions) {
        for (var i=0; i<defaultKeys.length; i++) {
          options[defaultKeys[i]] = ['cli', 'implied'].includes(optionsSource[defaultKeys[i]]) ? options[defaultKeys[i]] : configOptions[defaultKeys[i]]
        }
      }

      if (options.deliveryMode === 'PERSISTENT') {
        optionsSource.guaranteedPublisher = 'implied';
        options.guaranteedPublisher = true;
      }

      if (options.uiPortal) {
        feedPortal(options, optionsSource);
      } else {
        feedRun(options, optionsSource);
      }
    })

    // stm feed list
    const feedListCmd = feedCmd
      .command('list')
      .description(chalk.whiteBright('List event feeds'))
      .allowUnknownOption(false)
    addFeedListOptions(feedListCmd, this.advanced);
    feedListCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedListCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedList(options, optionsSource);
    })

    // stm feed import
    const feedImportCmd = feedCmd
      .command('import')
      .description(chalk.whiteBright('Import an event feed from downloaded archive'))
      .allowUnknownOption(false)
    addFeedImportOptions(feedImportCmd, this.advanced);
    feedImportCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedImportCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedImport(options, optionsSource);
    })

    // stm feed export to event portal
    const feedExportCmd = feedCmd
      .command('export')
      .description(chalk.whiteBright('Export an event feed to Event Portal'))
      .allowUnknownOption(false)
    addFeedExportOptions(feedExportCmd, this.advanced);
    feedExportCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedExportCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedExport(options, optionsSource);
    })

    // stm feed export
    const feedDownloadCmd = feedCmd
      .command('download')
      .description(chalk.whiteBright('Download an event feed'))
      .allowUnknownOption(false)
    addFeedDownloadOptions(feedDownloadCmd, this.advanced);
    feedDownloadCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedDownloadCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedDownload(options, optionsSource);
    })

    // stm feed contribute
    const feedContributeCmd = feedCmd
      .command('contribute')
      .description(chalk.whiteBright('Contribute to community event feeds'))
      .allowUnknownOption(false)
    addFeedContributeOptions(feedContributeCmd, this.advanced);
    feedContributeCmd.action((options: ManageFeedPublishOptions) => {
      const optionsSource:any = {};
      const defaultFeedKeys = Object.keys(defaultFeedConfig);
      for (var i=0; i<defaultFeedKeys.length; i++) {
        optionsSource[defaultFeedKeys[i]] = feedContributeCmd.getOptionValueSource(defaultFeedKeys[i]);
      }

      feedContribute(options, optionsSource);
    })
  }
}
