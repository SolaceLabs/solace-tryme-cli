import 'core-js'
import { Command } from 'commander'
import { version } from '../package.json'
import { defaultMessageConnectionConfig, defaultManageConnectionConfig } from './utils/defaults';
import { deleteConfig, initializeConfig, listConfig } from './utils/init'


import { addManageConnectionOptions, addManageSempConnectionOptions, 
        addConfigInitOptions, addConfigListOptions, addConfigDeleteOptions,
        addReceiveOptions, addRequestOptions,  addReplyOptions, 
        addManageQueueOptions, addManageAclProfileOptions, addManageClientProfileOptions, addManageClientUsernameOptions, 
        addVisualizeOptions, addVisualizeLaunchOptions, addSendOptions, addRootHelpOptions, addConfigHelpOptions, addManageHelpOptions, 
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
import { ManageClientOptionsEmpty, MessageClientOptionsEmpty } from './utils/instances';
import { loadCommandFromConfig } from './utils/config';
import sempConnection from './lib/semp-connection';
import chalk from 'chalk';
import { displayConfigHelpExamples, displayManageHelpExamples, displayRootHelpExamples } from './utils/examples';
import { Logger } from './utils/logger';

export class Commander {
  program: Command
  help: boolean
  advanced: boolean

  constructor(help: boolean, advanced: boolean) {
    this.program = new Command()
    this.help = help;
    this.advanced = advanced;
    const fetch = require('sync-fetch')

    const latestVersion = fetch('https://api.github.com/repos/SolaceLabs/solace-tryme-cli/releases/latest', {
      headers: {
        Accept: 'application/json'
      }
    }).json()
    if (`${'v' + version}` !== latestVersion.name)
      Logger.alert('A newer version of Solace Try-Me CLI is available: ' + latestVersion.html_url);
  }

  init(): void {
    const rootCmd = this.program
      .name('stm')
      .description(chalk.whiteBright('A Solace Try-Me client for the command line'))
      .enablePositionalOptions()
      .allowUnknownOption(false)
      .version(`${version}`, '-v, --version')
    addRootHelpOptions(rootCmd);
    rootCmd.action((options) => {
      if (options.helpExamples) 
        displayRootHelpExamples();
    });
      
    // stm send
    const sendCmd = this.program
      .command('send')
      .description(chalk.whiteBright('Execute a send command'))
      .allowUnknownOption(false)
    addSendOptions(sendCmd, this.advanced);
    sendCmd.action((options: MessageClientOptions) => {
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
    addReceiveOptions(receiveCmd, this.advanced);
    receiveCmd.action((options: MessageClientOptions) => {
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
    addRequestOptions(requestCmd, this.advanced);
    requestCmd.action((options: MessageClientOptions) => {
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
    addReplyOptions(replyCmd, this.advanced);
    replyCmd.action((options: MessageClientOptions) => {
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

    // stm visualize on
    const visualizeOnCmd = visualizeCmd
      .command('on')
      .description(chalk.whiteBright('Turn on visualization'))
      .allowUnknownOption(false)          
    addVisualizeOptions(visualizeOnCmd, this.advanced);
    visualizeOnCmd.action((options: MessageClientOptions) => {
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
    addVisualizeOptions(visualizeOffCmd, this.advanced);
    visualizeOffCmd.action((options: MessageClientOptions) => {
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
    addVisualizeLaunchOptions(visualizeLaunchCmd, this.advanced)
    visualizeLaunchCmd.action((options: MessageClientOptions) => {
      visualize(options);
    })  
}

    // stm config
    const configCmd = this.program
      .command('config')
      .description(chalk.whiteBright('Manage command configurations'))
      .allowUnknownOption(false)
    configCmd.action((options) => {
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
    addConfigInitOptions(configInitCmd, this.advanced)
    
    configInitCmd.action((options: MessageInitOptions) => {
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
    addConfigListOptions(configListCmd, this.advanced)

    configListCmd.action((options: MessageInitOptions) => {
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
    addConfigDeleteOptions(configDeleteCmd, this.advanced)
    configDeleteCmd.action((options: MessageInitOptions) => {
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
    manageCmd.action((options) => {
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
    addManageConnectionOptions(manageConnectionCmd, this.advanced);
    manageConnectionCmd.action((options: MessageClientOptions) => {
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
    addManageSempConnectionOptions(manageSempConnectionCmd, this.advanced);
    manageSempConnectionCmd.action((options: ManageClientOptions) => {
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
      .allowUnknownOption(false)
    addManageQueueOptions(manageQueueCmd, this.advanced);
    manageQueueCmd.action((options: ManageClientOptions) => {
      const cliOptions:any = {};
      const defaultKeys = Object.keys(new ManageClientOptionsEmpty('queue'));
      for (var i=0; i<defaultKeys.length; i++) {
        cliOptions[defaultKeys[i]] = manageQueueCmd.getOptionValueSource(defaultKeys[i]);
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
    addManageClientProfileOptions(manageClientProfileCmd, this.advanced);
    manageClientProfileCmd.action((options: ManageClientOptions) => {
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
    addManageAclProfileOptions(manageAclProfileCmd, this.advanced);
    manageAclProfileCmd.action((options: ManageClientOptions) => {
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
    addManageClientUsernameOptions(manageClientUsernameCmd, this.advanced);
    manageClientUsernameCmd.action((options: ManageClientOptions) => {
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

  }
}
