import * as fs from 'fs';
import { defaultStmHome } from './defaults';
import { Logger } from './logger';
import chalk from 'chalk';

const DISCLAIMER_FILE_NAME = 'ai-disclaimer-accepted';

/**
 * Get the path to the AI disclaimer acceptance file
 */
function getDisclaimerFilePath(): string {
  return `${defaultStmHome}/${DISCLAIMER_FILE_NAME}`;
}

/**
 * Check if the user has previously accepted the AI enhancement disclaimer
 * @returns true if disclaimer has been accepted, false otherwise
 */
export function hasAcceptedAiDisclaimer(): boolean {
  return fs.existsSync(getDisclaimerFilePath());
}

/**
 * Record that the user has accepted the AI enhancement disclaimer
 */
export function recordAiDisclaimerAcceptance(): void {
  const timestamp = new Date().toISOString();
  try {
    fs.writeFileSync(getDisclaimerFilePath(), timestamp, 'utf8');
  } catch (error: any) {
    Logger.logWarn(`Could not save AI disclaimer acceptance: ${error.message}`);
  }
}

/**
 * Reset the AI disclaimer acceptance (primarily for testing)
 */
export function resetAiDisclaimerAcceptance(): void {
  try {
    if (fs.existsSync(getDisclaimerFilePath())) {
      fs.unlinkSync(getDisclaimerFilePath());
    }
  } catch (error: any) {
    Logger.logWarn(`Could not reset AI disclaimer acceptance: ${error.message}`);
  }
}

/**
 * Display the AI enhancement disclaimer and prompt user for acceptance
 * @returns Promise<boolean> - true if user accepts, false if user declines
 */
export async function showAiDisclaimer(): Promise<boolean> {
  const { Confirm } = require('enquirer');

  // Display disclaimer header
  console.log('\n' + chalk.bold.yellowBright('═'.repeat(80)));
  console.log(chalk.bold.yellowBright('AI ENHANCEMENT DISCLAIMER'));
  console.log(chalk.bold.yellowBright('═'.repeat(80)));
  console.log();

  // Display disclaimer content
  console.log(chalk.white('The AI Enhancement feature uses generative AI models (including ') +
    chalk.cyanBright('Google Gemini') + chalk.white(' and'));
  console.log(chalk.cyanBright('Anthropic Claude') + chalk.white(' via ') +
    chalk.cyanBright('AWS Bedrock') + chalk.white(') to analyze your AsyncAPI specification and'));
  console.log(chalk.white('automatically generate field mappings and data generation rules.'));
  console.log();

  console.log(chalk.bold.whiteBright('IMPORTANT INFORMATION:'));
  console.log(chalk.white('  • Your AsyncAPI specification content will be sent to AWS Bedrock for processing'));
  console.log(chalk.white('  • The AI models may process schema definitions, field names, topic structures, and'));
  console.log(chalk.white('    message payload information from your AsyncAPI document'));
  console.log(chalk.white('  • Information is processed "as is" without guaranteed accuracy or completeness'));
  console.log(chalk.white('  • Generated mappings should be reviewed and validated before production use'));
  console.log();

  console.log(chalk.bold.whiteBright('PRIVACY & DATA PROTECTION:'));
  console.log(chalk.yellow('  • Do NOT include sensitive information, credentials, or proprietary data in AsyncAPI'));
  console.log(chalk.yellow('    specifications used with AI enhancement'));
  console.log(chalk.white('  • Your AsyncAPI content may be processed by third-party AI services'));
  console.log(chalk.white('  • Solace is not responsible for data processed by external AI services'));
  console.log();

  console.log(chalk.bold.whiteBright('USER RESPONSIBILITY:'));
  console.log(chalk.white('  • You are solely responsible for any data shared with AI enhancement features'));
  console.log(chalk.white('  • Review and validate all AI-generated mappings before use'));
  console.log(chalk.white('  • Use AI-generated results as a starting point, not as production-ready configuration'));
  console.log();

  console.log(chalk.bold.yellowBright('═'.repeat(80)));
  console.log();

  // Prompt for acceptance
  const prompt = new Confirm({
    message: chalk.bold.whiteBright('Do you accept these terms and wish to proceed with AI enhancement?'),
    initial: false
  });

  try {
    const answer = await prompt.run();
    return answer;
  } catch (error: any) {
    // User interrupted (Ctrl+C)
    Logger.logDetailedError('interrupted...', error.toString());
    return false;
  }
}
