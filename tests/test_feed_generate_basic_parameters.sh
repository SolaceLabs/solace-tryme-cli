#!/bin/bash

#
# Usage: ./test_feed_generate_basic_parameters.sh [START_TEST_NUMBER]
# Example: ./test_feed_generate_basic_parameters.sh 10  # Start from test 10

# Test script for feed generate command basic parameters
#
# Usage: ./test_feed_generate_basic_parameters.sh [START_TEST_NUMBER]
# Example: ./test_feed_generate_basic_parameters.sh 10  # Start from test 10

# Tests: Basic parameter validation and help output

# set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

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
    local test_number="${4:-}"
    
    if [ -n "$test_number" ]; then
        echo -e "${YELLOW}Running [$test_number]: $test_name${NC}"
    else
        echo -e "${YELLOW}Running: $test_name${NC}"
    fi
    echo -e "${WHITE}Command: $test_command${NC}"
    # echo -e "${WHITE}Expected result: $expected_result${NC}"
    local start_time=$(date +%s.%N)
    
    # Capture both stdout and stderr, and preserve exit code
    local output
    local exit_code
    # Use a subshell to properly capture exit code
    output=$(bash -c "$test_command" 2>&1)
    exit_code=$?
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)
    
    # Compare actual result with expected result
    if [ $exit_code -eq $expected_result ]; then
        # Result matches expectation
        if [ $exit_code -eq 0 ]; then
            record_test_result "$test_name" "PASS" "Command executed successfully as expected" "$duration" ""
            echo -e "${GREEN}✓ $test_name PASSED${NC}"
        else
            # Expected failure - extract error message
            local clean_error=$(echo "$output" | grep -E "^(error:|✖.*error:)" | sed 's/^[[:space:]]*✖[[:space:]]*error:[[:space:]]*//' | sed 's/^[[:space:]]*error:[[:space:]]*//' | head -1)
            record_test_result "$test_name" "PASS" "Command failed as expected" "$duration" "$clean_error"
            echo -e "${GREEN}✓ $test_name PASSED (Expected failure)${NC}"
            if [ -n "$clean_error" ]; then
                echo -e "${YELLOW}  Expected error: $clean_error${NC}"
            fi
        fi
    else
        # Result doesn't match expectation
        if [ $exit_code -eq 0 ]; then
            record_test_result "$test_name" "FAIL" "Command succeeded but was expected to fail" "$duration" ""
            echo -e "${RED}✗ $test_name FAILED (Expected failure but succeeded)${NC}"
        else
            # Unexpected failure - extract error message
            local clean_error=$(echo "$output" | grep -E "^(error:|✖.*error:)" | sed 's/^[[:space:]]*✖[[:space:]]*error:[[:space:]]*//' | sed 's/^[[:space:]]*error:[[:space:]]*//' | head -1)
            record_test_result "$test_name" "FAIL" "Command failed but was expected to succeed" "$duration" "$clean_error"
            echo -e "${RED}✗ $test_name FAILED (Expected success but failed)${NC}"
            if [ -n "$clean_error" ]; then
                echo -e "${RED}  Unexpected error: $clean_error${NC}"
            fi
        fi
    fi
}

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
    
    echo -e "\n${CYAN}=== DETAILED TEST RESULTS TABLE ===${NC}"
    printf "%-50s %-8s %-12s %-30s\n" "Test Scenario" "Status" "Time (s)" "Observation"
    printf "%-50s %-8s %-12s %-30s\n" "$(printf '%.50s' '----------------------------------------')" "--------" "------------" "$(printf '%.30s' '------------------------------')"
    
    for i in "${!TEST_SCENARIOS[@]}"; do
        local scenario="${TEST_SCENARIOS[$i]}"
        local status="${TEST_STATUSES[$i]}"
        local observation="${TEST_OBSERVATIONS[$i]}"
        local execution_time="${TEST_EXECUTION_TIMES[$i]}"
        local error="${TEST_ERRORS[$i]}"
        
        # Truncate long scenario names
        if [ ${#scenario} -gt 50 ]; then
            scenario="${scenario:0:47}..."
        fi
        
        # Truncate long observations
        if [ ${#observation} -gt 30 ]; then
            observation="${observation:0:27}..."
        fi
        
        # Color code status
        if [ "$status" = "PASS" ]; then
            printf "%-50s ${GREEN}PASS${NC} %-12s %-30s\n" "$scenario" "$execution_time" "$observation"
        elif [ "$status" = "FAIL" ]; then
            printf "%-50s ${RED}FAIL${NC} %-12s %-30s\n" "$scenario" "$execution_time" "$observation"
        else
            printf "%-50s ${YELLOW}SKIP${NC} %-12s %-30s\n" "$scenario" "$execution_time" "$observation"
        fi
        
        # Show error details for failed tests
        if [ -n "$error" ] && [ "${TEST_STATUSES[$i]}" = "FAIL" ]; then
            printf "%-50s %-8s %-12s %-30s\n" "  └─ Error:" "" "" "$(printf '%.30s' "$error")"
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

echo -e "${CYAN}=== Feed Generate Command Basic Parameters Test ===${NC}\n"

# Check if we're in the right directory (either root or tests folder)
if [ ! -f "bin/index.js" ] && [ ! -f "../bin/index.js" ]; then
    echo -e "${RED}Error: Please run this script from the solace-tryme-cli root directory or tests folder${NC}"
    exit 1
fi

# Set the correct path to the CLI
if [ -f "bin/index.js" ]; then
    CLI_PATH="bin/index.js"
else
    CLI_PATH="../bin/index.js"
fi

# Check if lint option should be removed
LINT_OPTION="--lint"
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    LINT_OPTION=""
    echo -e "${YELLOW}STM_TEST_EXECUTION is set to 1, will run the command by connecting to broker ${NC}"
else
    echo -e "${YELLOW}STM_TEST_EXECUTION not set, adding --lint option to all CLI commands${NC}"
fi

# Check for start test number argument
START_TEST=${1:-1}
if [ "$START_TEST" -lt 1 ]; then
    echo -e "${RED}Error: Start test number must be 1 or greater${NC}"
    exit 1
fi
echo -e "${YELLOW}Script: $0${NC}"
echo -e "${YELLOW}Starting tests from Test $START_TEST${NC}"

# Function to conditionally run tests based on start number
run_test_if_enabled() {
    local test_number="$1"
    local test_name="$2"
    local test_command="$3"
    local expected_result="$4"
    
    if [ "$test_number" -ge "$START_TEST" ]; then
        run_test "$test_name" "$test_command" "$expected_result" "$test_number"
    else
        echo -e "${YELLOW}Skipping Test $test_number: $test_name (before start point)${NC}"
    fi
}

# Test 1: Basic help output (short form)
run_test_if_enabled 1 "Basic help command (short form)" "node $CLI_PATH feed generate $LINT_OPTION -h" 0

# Test 2: Basic help output (long form)
run_test_if_enabled 2 "Basic help command (long form)" "node $CLI_PATH feed generate $LINT_OPTION --help" 0

# Test 3: Basic parameters validation (short forms)
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 3 "Basic parameters (short forms)" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' -file 'test-asyncapi.json'" 1
else
    run_test_if_enabled 3 "Basic parameters (short forms)" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' -file 'test-asyncapi.json'" 0
fi

# Test 4: Basic parameters validation (long forms)
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 4 "Basic parameters (long forms)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json'" 1
else
    run_test_if_enabled 4 "Basic parameters (long forms)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json'" 0
fi

# Test 5: Feed name parameter
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 5 "Feed name parameter" "node $CLI_PATH feed generate $LINT_OPTION -feed 'sample-feed' -file 'test-asyncapi.json'" 1
else
    run_test_if_enabled 5 "Feed name parameter" "node $CLI_PATH feed generate $LINT_OPTION -feed 'sample-feed' -file 'test-asyncapi.json'" 0
fi

# Test 7: Feed type parameter
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 7 "Feed type parameter (asyncapi)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'asyncapi'" 1
else
    run_test_if_enabled 7 "Feed type parameter (asyncapi)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'asyncapi'" 0
fi

# Test 8: Feed view parameter
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 8 "Feed view parameter (publisher)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'publisher'" 1
else
    run_test_if_enabled 8 "Feed view parameter (publisher)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'publisher'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 8 "Feed view parameter (provider)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'provider'" 1
else
    run_test_if_enabled 8 "Feed view parameter (provider)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'provider'" 0
fi

# Test 9: Custom feed type parameter
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 9 "Custom feed type parameter" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'custom'" 1
else
    run_test_if_enabled 9 "Custom feed type parameter" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'custom'" 0
fi

# Test 10: Parameter combinations
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 10 "Feed name with feed type combination" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'asyncapi'" 1
else
    run_test_if_enabled 10 "Feed name with feed type combination" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-type 'asyncapi'" 0
fi

# Test 11: Invalid parameter combination (missing feed name and file name)
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 11 "Invalid parameter combination (missing feed name and file name)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --feed-type 'asyncapi'" 1
else
    run_test_if_enabled 11 "Invalid parameter combination (missing feed name and file name)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --feed-type 'asyncapi'" 0
fi

# Test 12: Invalid feed type parameter
run_test_if_enabled 12 "Invalid feed type parameter" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --feed-type 'invalid_type'" 1

# Test 13: Invalid feed view parameter
run_test_if_enabled 13 "Invalid feed view parameter" "node $CLI_PATH feed generate $LINT_OPTION --feed-view 'invalid_view'" 1

# Test 14: Valid parameter combination - feed-view with feed-name
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 14 "Valid parameter combination (feed-view with feed-name)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'publisher'" 1
else
    run_test_if_enabled 14 "Valid parameter combination (feed-view with feed-name)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test-asyncapi.json' --feed-view 'publisher'" 0
fi

# Test 15: Non-existent file
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 15 "Non-existent file" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'non-existent.json'" 1
else
    run_test_if_enabled 15 "Non-existent file" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'non-existent.json'" 0
fi

# Test 16: Empty feed name
run_test_if_enabled 16 "Empty feed name" "node $CLI_PATH feed generate $LINT_OPTION --feed-name" 1

# Test 17: Empty file name
run_test_if_enabled 17 "Empty file name" "node $CLI_PATH feed generate $LINT_OPTION --file-name" 1

# Test 18: Short form parameters
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 18 "Short form file name" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' -file 'test.json'" 1
else
    run_test_if_enabled 18 "Short form file name" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' -file 'test.json'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 18 "Short form feed name" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' --file-name 'test.json'" 1
else
    run_test_if_enabled 18 "Short form feed name" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' --file-name 'test.json'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 18 "Short form feed type" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' -file 'test.json' -type 'asyncapi'" 1
else
    run_test_if_enabled 18 "Short form feed type" "node $CLI_PATH feed generate $LINT_OPTION -feed 'Core Banking' -file 'test.json' -type 'asyncapi'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 18 "Short form feed view" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json' -view 'publisher'" 1
else
    run_test_if_enabled 18 "Short form feed view" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json' -view 'publisher'" 0
fi

# Test 20: File extensions
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 20 "YAML file extension" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.yaml'" 1
else
    run_test_if_enabled 20 "YAML file extension" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.yaml'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 20 "YML file extension" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.yml'" 1
else
    run_test_if_enabled 20 "YML file extension" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.yml'" 0
fi

# Test 21: Parameter combinations
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 21 "All parameters together" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json' --feed-type 'asyncapi' --feed-view 'publisher'" 1
else
    run_test_if_enabled 21 "All parameters together" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json' --feed-type 'asyncapi' --feed-view 'publisher'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 21 "File name with feed view" "node $CLI_PATH feed generate $LINT_OPTION --file-name 'test.json' -feed 'Core Banking' --feed-view 'provider'" 1
else
    run_test_if_enabled 21 "File name with feed view" "node $CLI_PATH feed generate $LINT_OPTION --file-name 'test.json' -feed 'Core Banking' --feed-view 'provider'" 0
fi

# Test 22: Invalid combinations
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 22 "Feed name with file name (should be invalid)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json'" 1
else
    run_test_if_enabled 22 "Feed name with file name (should be invalid)" "node $CLI_PATH feed generate $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json'" 0
fi

# Generate test summary
generate_test_summary
