# Solace Try-Me CLI Test Suite

## Overview

This directory contains a comprehensive test suite for the Solace Try-Me CLI (`stm`) with **21 test scripts** covering CLI commands and sub-commands. The test suite provides complete parameter validation and comprehensive result tracking.

## Test Suite Structure

### Commands Tested (13 total)

#### Messaging Commands (4)
- `send` - Send messages to topics
- `receive` - Receive messages from topics/queues
- `request` - Send request messages
- `reply` - Send reply messages

#### Feed Commands (9)
- `feed preview` - Preview feed configurations
- `feed generate` - Generate events from feeds
- `feed configure` - Configure feed settings
- `feed run` - Run feeds with message publishing
- `feed list` - List available feeds
- `feed import` - Import feed configurations
- `feed export` - Export feed configurations
- `feed contribute` - Contribute feeds to community
- `feed download` - Download community feeds

### Test Types (Currently Implemented)

#### Basic Parameter Tests
- **Purpose**: Validate basic parameters and help output
- **Scope**: Parameter parsing, validation, help commands
- **Broker Required**: No
- **Files**: `test_{command}_{subcommand}_basic_parameters.sh`

#### Advanced Parameter Tests
- **Purpose**: Validate advanced parameters and comprehensive settings
- **Scope**: Advanced parameter parsing, conflict detection, edge cases
- **Broker Required**: No
- **Files**: `test_{command}_{subcommand}_advanced_parameters.sh`

#### Integration Tests
- **Status**: Not yet implemented
- **Planned**: End-to-end functionality testing with message validation

## Test Features

### Comprehensive Test Result Tracking
All test scripts include:
- **Test Scenario Recording**: What is being tested
- **Status Tracking**: PASS/FAIL/SKIP
- **Execution Time Monitoring**: Performance metrics
- **Error Details**: Comprehensive error reporting
- **Test Summary Generation**: Detailed results and statistics

### Message Validation (Messaging Commands)
Integration tests for messaging commands include:
- **Property Validation**: Delivery mode, TTL, user properties, etc.
- **Payload Validation**: Message content verification
- **Settings Consistency**: Sent vs received message comparison
- **Advanced Parameter Testing**: All message and session settings

### Environment Configuration
Tests use the `STM_TEST_EXECUTION` environment variable to control execution mode:
```bash
# Enable full execution mode with broker connections
export STM_TEST_EXECUTION=1

# Use lint mode (default behavior)
export STM_TEST_EXECUTION=0
# or simply unset the variable
```

## Running Tests

### Run All Tests
```bash
# Run all feed command tests
./run_all_tests_feed.sh

# Run all messaging command tests  
./run_all_tests_messaging.sh
```

### Test Options

#### Execution Mode (`STM_TEST_EXECUTION`)
Controls whether tests run with actual broker connections or in lint mode:
```bash
# Run tests with actual broker connections (default: 0)
STM_TEST_EXECUTION=1 ./run_all_tests_feed.sh

# Run tests in lint mode (default behavior)
STM_TEST_EXECUTION=0 ./test_send_basic_parameters.sh
# or simply
./test_send_basic_parameters.sh
```
**Benefits**: 
- **Lint Mode (default)**: Fast execution, no broker required, validates parameter parsing and help output
- **Execution Mode**: Full functionality testing with actual broker connections

### Run Individual Test Categories
```bash
# Basic parameter tests only
./test_send_basic_parameters.sh
./test_feed_preview_basic_parameters.sh

# Advanced parameter tests only
./test_receive_advanced_parameters.sh
./test_feed_run_advanced_parameters.sh

# Integration tests only
./test_request_integration.sh
./test_feed_generate_integration.sh
```

### Run by Command Type
```bash
# All messaging command tests
./test_send_*.sh
./test_receive_*.sh
./test_request_*.sh
./test_reply_*.sh

# All feed command tests
./test_feed_*_*.sh
```

## Test Output

Each test script generates:
- **Real-time Progress**: Live test execution status with color-coded results
- **Detailed Results**: Individual test scenario outcomes with execution time
- **Execution Summary**: Pass/fail statistics and success rates
- **Error Reporting**: Comprehensive error details for failed tests
- **Test Summary Table**: Formatted results with observations

### Sample Output
```
=== Send Command Basic Parameters Test ===

✓ Basic help command (short form) PASSED (0.023s)
✓ Basic help command (long form) PASSED (0.019s)
✓ Basic parameters (short forms) PASSED (0.031s)
✗ Invalid count parameter FAILED (0.015s) - Expected failure but succeeded

=== TEST EXECUTION SUMMARY ===
Total Tests: 15
Passed: 14
Failed: 1
Skipped: 0
Success Rate: 93%

=== DETAILED TEST RESULTS TABLE ===
Test Scenario                                    Status   Time (s)     Observation
----------------------------------------        --------  -----------  ------------------------------
Basic help command (short form)                 PASS      0.023        Command executed successfully
Invalid count parameter                          FAIL      0.015        Expected failure but succeeded

=== OVERALL RESULT ===
❌ SOME TESTS FAILED ❌
```

### Output Modes
- **Normal Mode**: Full verbose output with progress indicators and detailed test results
- **Lint Mode**: Fast parameter validation without full execution (default behavior)
- **Execution Mode**: Full functionality testing with actual broker connections

## Test Plan Documentation

For detailed testing strategy and implementation details, see:
- `TEST_PLAN.md` - Comprehensive testing documentation
- Individual test scripts for specific implementation details

## File Structure

```
tests/
├── README.md                              # This file
├── TEST_PLAN.md                          # Detailed test plan
├── run_all_tests_feed.sh                 # Feed command test runner
├── run_all_tests_messaging.sh            # Messaging command test runner
├── test_send_basic_parameters.sh         # Send command basic tests
├── test_send_advanced_parameters.sh      # Send command advanced tests
├── test_receive_basic_parameters.sh      # Receive command basic tests
├── test_receive_advanced_parameters.sh   # Receive command advanced tests
├── test_request_basic_parameters.sh      # Request command basic tests
├── test_request_advanced_parameters.sh   # Request command advanced tests
├── test_reply_basic_parameters.sh        # Reply command basic tests
├── test_reply_advanced_parameters.sh     # Reply command advanced tests
├── test_feed_preview_basic_parameters.sh # Feed preview basic tests
├── test_feed_preview_advanced_parameters.sh # Feed preview advanced tests
├── test_feed_generate_basic_parameters.sh # Feed generate basic tests
├── test_feed_generate_advanced_parameters.sh # Feed generate advanced tests
├── test_feed_configure_basic_parameters.sh # Feed configure basic tests
├── test_feed_configure_advanced_parameters.sh # Feed configure advanced tests
├── test_feed_run_basic_parameters.sh     # Feed run basic tests
├── test_feed_run_advanced_parameters.sh  # Feed run advanced tests
├── test_feed_list_basic_parameters.sh    # Feed list basic tests
└── update_test_scripts.sh                # Test script maintenance utility
```

**Note**: Integration tests and some advanced parameter tests are not yet implemented. The current test suite focuses on basic and advanced parameter validation for existing commands.

## Quick Start

### Basic Usage
```bash
# Run all feed command tests
./run_all_tests_feed.sh

# Run all messaging command tests
./run_all_tests_messaging.sh

# Run with execution mode (full broker connections)
STM_TEST_EXECUTION=1 ./run_all_tests_feed.sh

# Run specific command tests (default: lint mode)
./test_send_basic_parameters.sh
./test_feed_preview_advanced_parameters.sh
```

### Environment Setup
```bash
# Enable full execution mode for integration testing
export STM_TEST_EXECUTION=1

# Use lint mode for fast parameter validation (default)
export STM_TEST_EXECUTION=0
```

## Summary

This comprehensive test suite provides:
- **Partial Command Coverage**: 13 CLI commands planned, currently testing basic and advanced parameters
- **Parameter Validation**: Complete CLI parameter parsing and validation for implemented tests
- **Environment Flexibility**: Configurable execution modes (lint vs full execution)
- **Detailed Reporting**: Comprehensive test results with execution time and analytics
- **Multiple Execution Modes**: Lint mode (default) and execution mode for different use cases
- **Easy Execution**: Separate test runners for feed and messaging commands

The test suite provides reliable parameter validation for the Solace Try-Me CLI, with comprehensive coverage of implemented test scenarios and robust error handling.
