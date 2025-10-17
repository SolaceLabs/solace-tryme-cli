# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm run build` - Compile TypeScript to JavaScript (outputs to `./dist`)
- `npm run dev` - Watch mode compilation for development
- `tsc` - Direct TypeScript compilation
- `./bin/index.js` - Run the local development version directly

### Local Testing
- `stm --help` - Test CLI help (if globally installed)
- `./bin/index.js --help` - Test local build version
- `stm --version` - Check installed version

### Package Management
- `npm install` - Install dependencies after changes
- `npm run package` - Create distributable packages using pkg
- `npm run publish` - Build and publish to npm

## Architecture Overview

### Core Components

**CLI Entry Point**: `src/index.ts` contains the `Commander` class that sets up all CLI commands using commander.js. Each command (send, receive, request, reply, config, manage, feed) is configured with its options and maps to corresponding library functions.

**Command Structure**:
- **Messaging Commands**: `send`, `receive`, `request`, `reply` - Handle Solace pub/sub operations
- **Management Commands**: `manage` - Broker resource management (queues, profiles, connections)
- **Configuration Commands**: `config` - Persistent CLI configuration management
- **Feed Commands**: `feed` - AsyncAPI-based event feed generation and management

### Key Directories

- **`src/lib/`**: Core business logic for each command type (publish.ts, receive.ts, etc.)
- **`src/common/`**: Reusable client implementations for different message patterns
- **`src/utils/`**: Shared utilities (config management, logging, validation, option parsing)
- **`src/types/`**: TypeScript type definitions
- **`public/`**: Static assets and feed portal UI components
- **`documentation/`**: Comprehensive docs for messaging, feeds, and configuration

### Client Architecture

The application uses a layered client architecture:

1. **Command Layer** (`src/lib/`): High-level command implementations
2. **Client Layer** (`src/common/`): Protocol-specific client implementations
   - `publish-client.ts` - Publishing messages
   - `receive-client.ts` - Subscribing and receiving
   - `request-client.ts` / `reply-client.ts` - Request/reply patterns
   - `feed-publish-client.ts` - AsyncAPI feed publishing
3. **Solace Layer**: Uses `solclientjs` SDK for broker connectivity

### Configuration System

Commands support persistent configuration through:
- **Config Storage**: `~/.stm/` directory (configurable via `STM_HOME`)
- **Command Configs**: Saved parameter sets for reuse across command invocations
- **Connection Profiles**: Reusable broker connection settings

### Feed System Architecture

The feed system generates realistic event streams from AsyncAPI documents:
- **Feed Generation**: Parses AsyncAPI specs and creates data generation rules
- **Data Generation**: Uses Faker.js with custom rules for realistic mock data
- **Feed Management**: Import/export, validation, community contribution workflows
- **UI Portal**: Browser-based feed management interface

### Message Flow Patterns

- **Direct Messaging**: Point-to-point via topics
- **Queued Messaging**: Persistent delivery via Solace queues
- **Request/Reply**: Synchronous messaging patterns
- **Event Streaming**: AsyncAPI-driven continuous event generation

## Key Dependencies

- **solclientjs**: Solace PubSub+ JavaScript client library
- **commander**: CLI framework for option parsing and command structure
- **@faker-js/faker**: Mock data generation for feeds
- **@asyncapi/parser**: AsyncAPI document parsing and validation
- **chalk**: Terminal output coloring and formatting

## Important Notes

- The CLI checks for version updates on startup via GitHub API
- Configuration files are stored in `~/.stm/` by default (overrideable with `STM_HOME`)
- Event feeds must follow community contribution guidelines in `documentation/CONTRIBUTION_GUIDELINES.md`
- The application supports both direct broker connections and SEMP (management API) connections
- Visualization features are available when `SHOW_VISUALIZATION` environment variable is set

## AI-Powered Field Mapping

### Overview

The `stm feed generate` command supports AI-enhanced field mapping via the `--ai-enhance` flag. This feature uses an external AWS Lambda function to intelligently map fields in AsyncAPI specifications.

### Usage

```bash
# Generate feed with AI field mapping enhancement
stm feed generate \
  --file-name asyncapi.yaml \
  --feed-name "MyFeed" \
  --ai-enhance \
  --ai-mapper-endpoint "https://your-lambda-url.amazonaws.com/field-mapper"

# Or set endpoint via environment variable
export STM_FIELD_MAPPER_ENDPOINT="https://your-lambda-url.amazonaws.com/field-mapper"
stm feed generate --file-name asyncapi.yaml --ai-enhance
```

### What It Does

The AI field mapper performs two types of enhancements:

1. **Payload Field Enhancement**: Analyzes payload field types and names to generate realistic Faker.js data generation rules
2. **Topic Parameter Mapping**: Detects topic variables (e.g., `{employeeId}`, `{amount}`) that match payload field names and creates mappings to inject payload values into the topic address

### Topic Parameter Mapping Example

**AsyncAPI Topic with Variables:**
```yaml
channels:
  acmeRental/orders/created/v1/{region}/{orderId}:
    parameters:
      region:
        schema:
          type: string
      orderId:
        schema:
          type: string
    message:
      payload:
        type: object
        properties:
          orderId:
            type: number
          customerName:
            type: string
          amount:
            type: number
```

**Generated Mapping:**
```json
{
  "mappings": [
    {
      "type": "Topic Parameter",
      "source": {
        "type": "Payload Parameter",
        "name": "orderId",
        "fieldName": "orderId",
        "fieldType": "number"
      },
      "target": {
        "type": "Topic Parameter",
        "name": "orderId",
        "fieldName": "orderId",
        "fieldType": "string"
      }
    }
  ]
}
```

**Result**: When events are published, the `orderId` value generated for the payload (e.g., `12345`) will be automatically used in the topic address: `acmeRental/orders/created/v1/us-east/12345`

### Field Mapper Lambda Requirements

The Lambda function endpoint should:

1. Accept POST requests with JSON body:
   ```json
   {
     "feedrules": [...],
     "asyncApiSpec": {...}
   }
   ```

2. Return response format:
   ```json
   {
     "success": true,
     "enhancedFeedrules": [...],
     "summary": {
       "totalFields": 10,
       "improved": 7,
       "unchanged": 3,
       "improvementPercentage": 70
     },
     "context": {
       "eventName": "Order Created",
       "topic": "acmeRental/orders/created/v1/{region}/{orderId}",
       "domain": "Retail"
     }
   }
   ```

3. Process each feedrule to:
   - Parse topic string to extract variable placeholders (regex: `/\{([^}]+)\}/g`)
   - Identify matches where topic variable names equal payload field names
   - Generate Faker.js rules for payload fields based on field names/types
   - Create Topic Parameter mappings for matched fields
   - Include all mappings in the `mappings` array of each feedrule

### Implementation Reference

See `src/utils/field-mapper-client.ts` for the client implementation and detailed JSDoc documentation.

## STM Feed Commands (Non-Interactive)

### Feed Event Name Bug & Workaround

**Issue**: There's a bug in `src/lib/feed-run.ts` where event names for `--event-names` must include both the message name AND topic with exactly 6 spaces between them, due to this line:
```typescript
name: event.name + '      ' + event.topic
```

### How to Run Feeds Non-Interactively

**Method 1: Get Event Names from Interactive Mode**
```bash
# Run interactive mode once to see available events
stm feed run --feed-name "YourFeedName"
# Copy the exact event text shown in the selection prompt
```

**Method 2: Use Full Event Identifier Format**
```bash
# Format: "message_name      topic_name" (exactly 6 spaces)
stm feed run \
  --feed-name "DynamicPricingEngine-0" \
  --event-names "subscribe.message      acmeRental/pricingAvailability/pricing/updated/v1/{vehicleType}/{location}" \
  --count 10
```

**Method 3: Multiple Events**
```bash
stm feed run \
  --feed-name "DynamicPricingEngine-0" \
  --event-names \
    "subscribe.message      acmeRental/pricingAvailability/pricing/updated/v1/{vehicleType}/{location}" \
    "subscribe.message      acmeRental/pricingAvailability/promotion/applied/v1/{promotionID}/{vehicleType}" \
  --count 5
```

### Common Feed Commands

```bash
# List available feeds
stm feed list --local-only
stm feed list --community-only

# Preview feed structure
stm feed preview --feed-name "YourFeedName"
stm feed preview --feed-name "YourFeedName" --community-feed

# Run community feed
stm feed run --feed-name "Point_of_Sale_System" --community-feed --event-names "EventName" --count 10

# Continuous streaming (count=0)
stm feed run --feed-name "YourFeed" --event-names "YourEvent" --count 0

# Custom intervals and delays
stm feed run --feed-name "YourFeed" --event-names "YourEvent" --count 5 --interval 2000 --initial-delay 1000
```

**Key Parameters:**
- `--feed-name` - Exact feed name (required to avoid feed selection prompt)
- `--event-names` - Full event identifiers (required to avoid event selection prompt)
- `--community-feed` - Use for community feeds vs local feeds
- `--count` - Number of events (0 = continuous streaming)
- `--interval` - Milliseconds between events
- `--config` - Custom configuration file path

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
  gemini command:

### Examples:

**Single file analysis:**
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results