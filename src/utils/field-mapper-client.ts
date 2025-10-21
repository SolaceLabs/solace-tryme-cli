import { Logger } from './logger';
import chalk from 'chalk';

// Default endpoint - can be overridden via environment variable or command line flag
const DEFAULT_FIELD_MAPPER_ENDPOINT = process.env.STM_FIELD_MAPPER_ENDPOINT ||
  'https://b0hv9uf5m8.execute-api.us-east-2.amazonaws.com/Prod/fieldmap';

/**
 * Mapping between topic parameters and payload parameters
 */
export interface FieldMapping {
  type: 'Topic Parameter';
  source: {
    type: 'Payload Parameter' | 'Topic Parameter';
    name: string;
    fieldName: string;
    fieldType: string;
  };
  target: {
    type: 'Topic Parameter' | 'Payload Parameter';
    name: string;
    fieldName: string;
    fieldType: string;
  };
}

/**
 * Response from the AI Field Mapper Lambda function
 */
export interface FieldMapperResponse {
  success: boolean;
  enhancedFeedrules: any[];
  summary: {
    totalFields: number;
    improved: number;
    unchanged: number;
    improvementPercentage: number;
  };
  context: {
    eventName: string;
    topic: string;
    domain: string;
  };
}

export interface FieldMapperError {
  error: string;
  details?: string[];
  errorType?: string;
}

/**
 * Call the AI Field Mapper Lambda function to enhance feedrules with intelligent field mappings.
 *
 * This function sends feedrules and AsyncAPI specification to an AI-powered Lambda function that:
 * 1. Analyzes payload field types and names to generate realistic Faker.js rules
 * 2. Identifies topic variables (e.g., {amount}, {employeeId}) that match payload field names
 * 3. Creates mappings to use payload-generated values in topic addresses
 *
 * Example: If the topic is "orders/{orderId}" and payload has an "orderId" field,
 * the Lambda will generate a mapping to inject the payload's orderId value into the topic.
 *
 * @param feedrules - The vanilla/generic feedrules to enhance with mappings array
 * @param asyncApiSpec - The AsyncAPI specification containing topic and payload schemas
 * @param endpoint - Optional custom endpoint URL (defaults to hard-coded endpoint or STM_FIELD_MAPPER_ENDPOINT env var)
 * @returns Enhanced feedrules with mappings array populated, or null on failure
 *
 * @example
 * const enhanced = await enhanceFeedrulesWithAI(
 *   [{ topic: 'acme/{region}/{employeeId}', topicParameters: {...}, payload: {...} }],
 *   asyncApiSpec,
 *   'https://my-lambda-url.com'
 * );
 * // Returns feedrules with mappings like:
 * // mappings: [
 * //   {
 * //     type: 'Topic Parameter',
 * //     source: { type: 'Payload Parameter', name: 'employeeId', fieldType: 'number' },
 * //     target: { type: 'Topic Parameter', name: 'employeeId', fieldType: 'string' }
 * //   }
 * // ]
 */
export async function enhanceFeedrulesWithAI(
  feedrules: any[],
  asyncApiSpec: any,
  endpoint?: string
): Promise<any[] | null> {
  const apiEndpoint = endpoint || DEFAULT_FIELD_MAPPER_ENDPOINT;

  if (!apiEndpoint) {
    // This should not happen since we have a hard-coded default, but keep as safety check
    Logger.logError('No field mapper endpoint configured');
    Logger.logWarn('Set STM_FIELD_MAPPER_ENDPOINT environment variable or use --ai-mapper-endpoint flag');
    return null;
  }

  Logger.info('Enhancing feedrules using AI field mapper...');
  Logger.logInfo(`Endpoint: ${chalk.cyanBright(apiEndpoint)}`);

  const requestBody = {
    feedrules,
    asyncApiSpec
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData: FieldMapperError = await response.json();
      Logger.logError(`Field mapper returned error (${response.status}): ${errorData.error}`);
      if (errorData.details) {
        errorData.details.forEach(detail => Logger.logWarn(`  - ${detail}`));
      }
      return null;
    }

    const result: FieldMapperResponse = await response.json();

    if (!result.success) {
      Logger.logError('Field mapper did not succeed');
      return null;
    }

    // Log summary
    Logger.logSuccess('Field mapping completed successfully!');
    Logger.logInfo(`Context: ${chalk.greenBright(result.context.eventName)} in ${chalk.cyanBright(result.context.domain)}`);
    Logger.logInfo(`Topic: ${chalk.yellowBright(result.context.topic)}`);
    Logger.logInfo(`Fields analyzed: ${chalk.whiteBright(result.summary.totalFields)}`);
    Logger.logInfo(`Improved mappings: ${chalk.greenBright(result.summary.improved)} (${result.summary.improvementPercentage}%)`);
    Logger.logInfo(`Unchanged: ${chalk.gray(result.summary.unchanged)}`);

    return result.enhancedFeedrules;

  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      Logger.logError('Failed to connect to field mapper endpoint');
      Logger.logWarn('Please check that the endpoint is correct and accessible');
    } else if (error.name === 'AbortError') {
      Logger.logError('Request to field mapper timed out');
    } else {
      Logger.logError(`Error calling field mapper: ${error.message}`);
    }
    Logger.logDetailedError('Field mapper error', error.toString());
    return null;
  }
}

/**
 * Validate that the field mapper endpoint is accessible
 * @param endpoint - The endpoint URL to validate
 * @returns true if accessible, false otherwise
 */
export async function validateFieldMapperEndpoint(endpoint: string): Promise<boolean> {
  if (!endpoint) {
    return false;
  }

  try {
    // Try to parse as URL
    new URL(endpoint);

    // Optionally, you could make a HEAD or OPTIONS request here
    // For now, just validate the URL format
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get the configured field mapper endpoint
 * @returns The endpoint URL or null if not configured
 */
export function getFieldMapperEndpoint(): string | null {
  return DEFAULT_FIELD_MAPPER_ENDPOINT || null;
}
