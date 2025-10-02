# Solace Try-Me CLI Testing Plan

## Overview

This document outlines the comprehensive testing strategy for the Solace Try-Me CLI (`stm`). The testing framework is designed to validate all CLI commands and sub-commands with three types of tests per command, including comprehensive message settings validation.

## Testing Framework Architecture

### Three Types of Test Scripts per Command

#### Type A: Basic Parameter Test Scripts
- **Purpose**: Validate all basic parameters (from `-h` help output)
- **Scope**: Parameter parsing, validation, help output
- **Broker Required**: No
- **Naming Convention**: `test_{command}_{subcommand}_basic_parameters.sh` (for feed commands) or `test_{command}_basic_parameters.sh` (for messaging commands)

#### Type B: Advanced Parameter Test Scripts
- **Purpose**: Validate all advanced parameters (from `-hm` help output)
- **Scope**: Advanced parameter parsing, conflict detection, comprehensive validation
- **Broker Required**: No
- **Naming Convention**: `test_{command}_{subcommand}_advanced_parameters.sh` (for feed commands) or `test_{command}_advanced_parameters.sh` (for messaging commands)

#### Type C: Full Integration Test Scripts
- **Purpose**: Test actual send/receive operations with comprehensive message validation (for messaging commands) or CLI parameter validation (for feed commands)
- **Scope**: End-to-end functionality, message settings verification, payload validation (messaging) or CLI parameter testing (feed commands)
- **Broker Required**: Yes (for messaging commands), No (for feed commands)
- **Naming Convention**: `test_{command}_{subcommand}_integration.sh` (for feed commands) or `test_{command}_integration.sh` (for messaging commands)

## Command Coverage Matrix

### Messaging Commands (4 commands)
- `send` → 3 test scripts (basic, advanced, integration)
- `receive` → 3 test scripts (basic, advanced, integration)
- `request` → 3 test scripts (basic, advanced, integration)
- `reply` → 3 test scripts (basic, advanced, integration)

### Feed Commands (9 commands)
- `feed preview` → 3 test scripts (basic, advanced, integration)
- `feed generate` → 3 test scripts (basic, advanced, integration)
- `feed configure` → 3 test scripts (basic, advanced, integration)
- `feed run` → 3 test scripts (basic, advanced, integration)
- `feed list` → 3 test scripts (basic, advanced, integration)
- `feed import` → 3 test scripts (basic, advanced, integration)
- `feed export` → 3 test scripts (basic, advanced, integration)
- `feed contribute` → 3 test scripts (basic, advanced, integration)
- `feed download` → 3 test scripts (basic, advanced, integration)

**Total Test Scripts**: 39 scripts (13 commands × 3 types)

## Message Settings Validation Framework

### Available Message Properties for Validation

#### Core Message Properties
- `Destination` (topic name)
- `Delivery Mode` (DIRECT/PERSISTENT)
- `Payload Type` (TEXT/BYTES)
- `Time To Live` (TTL)
- `DMQ Eligible` (true/false)
- `Eliding Eligible` (true/false)

#### Application Properties
- `Application Message ID`
- `Application Message Type`
- `Correlation ID`
- `Correlation Key`
- `Reply To Topic`
- `Sequence Number`

#### User Properties
- Custom key-value pairs (e.g., `testKey:testValue`)

#### HTTP Properties
- `HTTP Content Type`
- `HTTP Content Encoding`

#### Session Properties
- `Client Name`
- `Sender ID` (if enabled)
- `Send Timestamps` (if enabled)
- `Sequence Numbers` (if enabled)

### Message Validation Strategy

#### Send Command Validation
```bash
# Send with specific settings
node ../bin/index.js send \
  --topic "test/validation" \
  --delivery-mode PERSISTENT \
  --app-message-type "validation-test" \
  --user-properties "testKey:testValue" \
  --time-to-live 30000 \
  --count 1
```

#### Receive Command Validation
```bash
# Receive with FULL output mode to capture all properties
node ../bin/index.js receive \
  --topic "test/validation" \
  --output-mode FULL \
  --exit-after 10
```

#### Validation Logic
1. **Extract sent parameters** from send command
2. **Capture received message** with FULL output mode
3. **Parse received properties** from log output
4. **Compare sent vs received** properties
5. **Validate payload content** matches expected format (focus on properties, payload validation is optional)

### Feed Command Integration Testing
For feed commands that don't involve send/receive operations (preview, generate, list, import, export, contribute, download), integration tests focus on:
- **CLI parameter validation** with actual file operations
- **AsyncAPI document processing** validation
- **File I/O operations** testing
- **Output format validation**

## Built-in Control Mechanisms

### Publish Control
```bash
# Send 1 event with specific settings
node ../bin/index.js send --count 1 --topic "test/topic" --delivery-mode PERSISTENT

# Feed run with 1 event and specific settings
node ../bin/index.js feed run --count 1 --feed-name "TestFeed" --delivery-mode PERSISTENT
```

### Receive Control
```bash
# Receive with 10-second timeout and FULL output
node ../bin/index.js receive --topic "test/topic" --exit-after 10 --output-mode FULL
```

### Broker Configuration
Tests use environment variables for broker configuration with fallback to defaults:
```bash
# Environment variables (optional)
export TEST_BROKER_URL="ws://localhost:8008"
export TEST_BROKER_VPN="default"
export TEST_BROKER_USERNAME="default"
export TEST_BROKER_PASSWORD="default"

# Fallback to defaults if not set
BROKER_URL=${TEST_BROKER_URL:-"ws://localhost:8008"}
BROKER_VPN=${TEST_BROKER_VPN:-"default"}
BROKER_USERNAME=${TEST_BROKER_USERNAME:-"default"}
BROKER_PASSWORD=${TEST_BROKER_PASSWORD:-"default"}
```

### Message Validation Functions
```bash
# Extract and validate message properties
validate_message_properties() {
    local sent_properties="$1"
    local received_log="$2"
    
    # Validate delivery mode
    validate_delivery_mode "$sent_properties" "$received_log"
    
    # Validate app message type
    validate_app_message_type "$sent_properties" "$received_log"
    
    # Validate user properties
    validate_user_properties "$sent_properties" "$received_log"
    
    # Validate TTL
    validate_ttl "$sent_properties" "$received_log"
    
    # Validate payload content
    validate_payload_content "$sent_properties" "$received_log"
}
```

## Test Script Structure Templates

### Basic/Advanced Parameter Tests
```bash
#!/bin/bash
# Test script for [COMMAND] [BASIC/ADVANCED] parameters

# 1. Setup and validation
# 2. Initialize test result tracking
# 3. Help output tests (-h, -hm)
# 4. Parameter parsing tests (short/long forms)
# 5. Parameter conflict detection
# 6. Invalid parameter testing
# 7. Record test results for each scenario
# 8. Generate comprehensive test summary report
```

### Integration Tests
```bash
#!/bin/bash
# Test script for [COMMAND] integration with message validation

# 1. Setup and broker connectivity check
# 2. Initialize test result tracking
# 3. Start receive command in background (FULL output mode)
# 4. Execute send command with specific parameters
# 5. Capture and parse received message properties
# 6. Validate sent vs received message settings
# 7. Validate payload content and format
# 8. Record test results for each scenario
# 9. Generate comprehensive test summary report
```

## Test Result Recording and Reporting

### Test Result Tracking Framework
All test scripts implement a comprehensive result tracking system that records:
- **Test Scenario**: Description of what is being tested
- **Status**: PASS/FAIL/SKIP
- **Observation**: Detailed notes about the test execution and results
- **Execution Time**: How long the test took to run
- **Error Details**: Any error messages or unexpected behavior

### Test Result Data Structure
```bash
# Test result tracking variables
declare -a TEST_SCENARIOS=()
declare -a TEST_STATUSES=()
declare -a TEST_OBSERVATIONS=()
declare -a TEST_EXECUTION_TIMES=()
declare -a TEST_ERRORS=()

# Function to record test results
record_test_result() {
    local scenario="$1"
    local status="$2"
    local observation="$3"
    local execution_time="$4"
    local error_details="$5"
    
    TEST_SCENARIOS+=("$scenario")
    TEST_STATUSES+=("$status")
    TEST_OBSERVATIONS+=("$observation")
    TEST_EXECUTION_TIMES+=("$execution_time")
    TEST_ERRORS+=("$error_details")
}

# Function to run a test and record results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    local start_time=$(date +%s.%N)
    
    if eval "$test_command" >/dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc)
        record_test_result "$test_name" "PASS" "Command executed successfully" "$duration" ""
        echo -e "${GREEN}✓ $test_name PASSED${NC}"
    else
        local end_time=$(date +%s.%N)
        local duration=$(echo "$end_time - $start_time" | bc)
        local error_output=$(eval "$test_command" 2>&1)
        record_test_result "$test_name" "FAIL" "Command failed to execute" "$duration" "$error_output"
        echo -e "${RED}✗ $test_name FAILED${NC}"
    fi
}
```

### Test Summary Report Generation
```bash
# Function to generate comprehensive test summary
generate_test_summary() {
    local total_tests=${#TEST_SCENARIOS[@]}
    local passed_tests=0
    local failed_tests=0
    local skipped_tests=0
    
    # Count test results
    for status in "${TEST_STATUSES[@]}"; do
        case "$status" in
            "PASS") ((passed_tests++)) ;;
            "FAIL") ((failed_tests++)) ;;
            "SKIP") ((skipped_tests++)) ;;
        esac
    done
    
    echo -e "\n${CYAN}=== TEST EXECUTION SUMMARY ===${NC}"
    echo -e "${WHITE}Total Tests: $total_tests${NC}"
    echo -e "${GREEN}Passed: $passed_tests${NC}"
    echo -e "${RED}Failed: $failed_tests${NC}"
    echo -e "${YELLOW}Skipped: $skipped_tests${NC}"
    
    # Calculate success rate
    if [ $total_tests -gt 0 ]; then
        local success_rate=$((passed_tests * 100 / total_tests))
        echo -e "${WHITE}Success Rate: $success_rate%${NC}"
    fi
    
    echo -e "\n${CYAN}=== DETAILED TEST RESULTS ===${NC}"
    for i in "${!TEST_SCENARIOS[@]}"; do
        local scenario="${TEST_SCENARIOS[$i]}"
        local status="${TEST_STATUSES[$i]}"
        local observation="${TEST_OBSERVATIONS[$i]}"
        local execution_time="${TEST_EXECUTION_TIMES[$i]}"
        local error="${TEST_ERRORS[$i]}"
        
        echo -e "\n${YELLOW}Test: $scenario${NC}"
        echo -e "  Status: $status"
        echo -e "  Execution Time: ${execution_time}s"
        echo -e "  Observation: $observation"
        
        if [ -n "$error" ] && [ "$status" = "FAIL" ]; then
            echo -e "  Error Details: $error"
        fi
    done
    
    # Overall test result
    echo -e "\n${CYAN}=== OVERALL RESULT ===${NC}"
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
        return 0
    else
        echo -e "${RED}❌ SOME TESTS FAILED ❌${NC}"
        return 1
    fi
}
```

### Test Report Output Format
Each test script generates a comprehensive report with:

#### Summary Section
- Total number of tests executed
- Number of passed/failed/skipped tests
- Success rate percentage
- Overall execution time

#### Detailed Results Section
For each test scenario:
- **Test Name**: Clear description of what was tested
- **Status**: PASS/FAIL/SKIP
- **Execution Time**: Time taken to run the test
- **Observation**: Detailed notes about the test execution
- **Error Details**: Full error output for failed tests

#### Example Test Report
```
=== TEST EXECUTION SUMMARY ===
Total Tests: 15
Passed: 14
Failed: 1
Skipped: 0
Success Rate: 93%

=== DETAILED TEST RESULTS ===

Test: Basic help command (-h)
  Status: PASS
  Execution Time: 0.123s
  Observation: Help command executed successfully

Test: Advanced help command (-hm)
  Status: PASS
  Execution Time: 0.145s
  Observation: Advanced help displayed correctly

Test: Invalid parameter combination
  Status: FAIL
  Execution Time: 0.089s
  Observation: Command failed to execute
  Error Details: Error: conflicting options detected

=== OVERALL RESULT ===
❌ SOME TESTS FAILED ❌
```

## Message Validation Implementation

### Property Extraction Functions
```bash
extract_delivery_mode() {
    local log_file="$1"
    grep -o "Delivery Mode: [A-Z]*" "$log_file" | cut -d' ' -f3
}

extract_app_message_type() {
    local log_file="$1"
    grep -o "Application Message Type: [^[:space:]]*" "$log_file" | cut -d' ' -f4
}

extract_user_properties() {
    local log_file="$1"
    grep -A 10 "User Properties:" "$log_file" | grep -E "^\s+[^:]+:" | sed 's/^\s*//'
}

extract_ttl() {
    local log_file="$1"
    grep -o "Time To Live: [0-9]*" "$log_file" | cut -d' ' -f4
}
```

### Validation Functions
```bash
validate_delivery_mode() {
    local expected="$1"
    local actual="$2"
    if [ "$expected" = "$actual" ]; then
        echo "✓ Delivery mode validation PASSED: $actual"
        return 0
    else
        echo "✗ Delivery mode validation FAILED: expected $expected, got $actual"
        return 1
    fi
}

validate_user_properties() {
    local expected_props="$1"
    local received_log="$2"
    local validation_passed=true
    
    echo "$expected_props" | while IFS=':' read -r key value; do
        if ! grep -q "$key.*$value" "$received_log"; then
            echo "✗ User property validation FAILED: $key:$value not found"
            validation_passed=false
        fi
    done
    
    if [ "$validation_passed" = true ]; then
        echo "✓ User properties validation PASSED"
        return 0
    else
        return 1
    fi
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Create test framework utilities and validation functions
2. Implement basic parameter tests for messaging commands
3. Set up message validation infrastructure

### Phase 2: Advanced Testing (Week 2)
1. Implement advanced parameter tests for all commands
2. Add comprehensive parameter conflict detection
3. Create message validation test suite

### Phase 3: Integration Testing (Week 3)
1. Implement full integration tests with message validation
2. Add payload content validation
3. Create end-to-end test scenarios

### Phase 4: Feed Command Testing (Week 4)
1. Implement feed command tests with message validation
2. Test feed-specific message generation
3. Validate feed payload against AsyncAPI schemas

## Key Features of the Enhanced Plan

### Comprehensive Message Validation
- **All message properties** validated (delivery mode, TTL, user properties, etc.)
- **Payload content validation** against expected format
- **Settings consistency** between sent and received messages
- **Feed-specific validation** for generated events

### Robust Testing Framework
- **39 test scripts** covering all commands and scenarios
- **Parameter validation** without broker dependency
- **Integration testing** with full message validation
- **Comprehensive test result recording** with detailed reporting
- **Clear success/failure reporting** with detailed diagnostics
- **Test execution tracking** with timing and observation notes

### Flexible Execution
- **Basic/Advanced tests** run without broker
- **Integration tests** require broker with timeout controls
- **Message validation** with configurable validation rules
- **Comprehensive logging** for debugging and analysis
- **Test result persistence** for analysis and reporting
- **Automated test summary generation** with pass/fail statistics

## Test Execution

### Running Basic/Advanced Tests
```bash
# Run all basic parameter tests
./test_send_basic_parameters.sh
./test_receive_basic_parameters.sh
./test_request_basic_parameters.sh
./test_reply_basic_parameters.sh

# Run all advanced parameter tests
./test_send_advanced_parameters.sh
./test_receive_advanced_parameters.sh
./test_request_advanced_parameters.sh
./test_reply_advanced_parameters.sh
```

### Running Integration Tests
```bash
# Prerequisites: Solace PubSub+ broker running on ws://localhost:8008
# Run integration tests
./test_send_integration.sh
./test_receive_integration.sh
./test_request_integration.sh
./test_reply_integration.sh
```

### Running Feed Command Tests
```bash
# Basic/Advanced tests (no broker required)
./test_feed_preview_basic_parameters.sh
./test_feed_generate_advanced_parameters.sh
./test_feed_configure_basic_parameters.sh

# Integration tests (broker required for feed run only)
./test_feed_run_integration.sh

# Integration tests (no broker required for other feed commands)
./test_feed_preview_integration.sh
./test_feed_generate_integration.sh
./test_feed_list_integration.sh
./test_feed_import_integration.sh
./test_feed_export_integration.sh
./test_feed_contribute_integration.sh
./test_feed_download_integration.sh
```

## Success Criteria

### Basic/Advanced Parameter Tests
- ✅ All help commands (`-h`, `-hm`) execute successfully
- ✅ All parameter parsing works correctly (short/long forms)
- ✅ Parameter conflicts are detected and handled gracefully
- ✅ Invalid parameters show appropriate error messages
- ✅ Invalid parameter combinations are tested and handled correctly

### Integration Tests
- ✅ Broker connectivity is established successfully
- ✅ Messages are sent and received correctly
- ✅ All message properties match between sent and received
- ✅ Payload content is preserved and validated
- ✅ Message settings are applied correctly

### Feed Command Tests
- ✅ Feed generation works with AsyncAPI documents
- ✅ Generated events match AsyncAPI specifications
- ✅ Feed configuration is applied correctly
- ✅ Community feeds are accessible and functional
- ✅ CLI parameters work correctly for all feed sub-commands
- ✅ File I/O operations work as expected
- ✅ Output formats are validated correctly

## Maintenance and Updates

### Adding New Commands
1. Create three test scripts following the naming convention:
   - `test_{command}_{subcommand}_basic_parameters.sh` (for feed commands)
   - `test_{command}_{subcommand}_advanced_parameters.sh` (for feed commands)
   - `test_{command}_{subcommand}_integration.sh` (for feed commands)
   - Or `test_{command}_basic_parameters.sh` (for messaging commands)
2. Implement basic parameter validation
3. Add advanced parameter testing
4. Create integration test with message validation (messaging) or CLI parameter testing (feed commands)
5. Update this documentation

### Updating Existing Tests
1. Modify test scripts to reflect CLI changes
2. Update validation functions for new message properties
3. Test with new broker versions
4. Update documentation as needed

## Troubleshooting

### Common Issues
- **Broker Connection**: Ensure Solace PubSub+ broker is running on ws://localhost:8008 (or set TEST_BROKER_URL environment variable)
- **Permission Issues**: Check broker credentials and VPN access (use TEST_BROKER_* environment variables)
- **Timeout Issues**: Adjust timeout values in test scripts
- **Message Validation**: Verify FULL output mode is used for property extraction
- **Invalid Parameters**: Tests include invalid parameter validation - this is expected behavior

### Debug Mode
```bash
# Enable debug output in test scripts
export DEBUG=true
./test_send_integration.sh
```

## Conclusion

This comprehensive testing plan ensures that all CLI commands and sub-commands are thoroughly tested with three levels of validation:

1. **Parameter validation** without broker dependency
2. **Advanced parameter testing** with conflict detection
3. **Full integration testing** with comprehensive message validation (messaging commands) or CLI parameter testing (feed commands)

The plan provides complete confidence in the CLI's functionality and message handling capabilities, ensuring reliable operation across all supported scenarios.

## Summary of Clarifications Applied

1. **✅ Added all feed commands**: Including `configure`, `contribute`, and `download`
2. **✅ Feed integration tests**: Focus on CLI parameter validation, not send/receive operations
3. **✅ Message validation scope**: Focus on properties, payload validation is optional (no Faker.js involvement)
4. **✅ Test data management**: Run, compare, and report results (no special setup needed)
5. **✅ Broker configuration**: Use TEST_* environment variables with fallback to localhost defaults
6. **✅ Error testing**: Include invalid parameter testing, exclude network/broker failure testing
7. **✅ Naming convention**: `test_{command}_{subcommand}_*.sh` for feed commands, `test_{command}_*.sh` for messaging commands
8. **✅ Test result recording**: All tests record results with scenario, status, observation, and timing
9. **✅ Comprehensive reporting**: Generate detailed test summary with pass/fail statistics and error details

**Total Test Scripts**: 39 scripts (13 commands × 3 types)
