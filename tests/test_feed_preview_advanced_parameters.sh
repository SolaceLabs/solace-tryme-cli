#!/bin/bash

# Test script for feed preview command advanced parameters
# Tests: Advanced parameter validation and help output
#
# Usage: ./test_feed_preview_advanced_parameters.sh [START_TEST_NUMBER]
# Example: ./test_feed_preview_advanced_parameters.sh 10  # Start from test 10

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

echo -e "${CYAN}=== Feed Preview Command Advanced Parameters Test ===${NC}\n"

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

# Test 1: Advanced help output
run_test_if_enabled 1 "Advanced help command" "node $CLI_PATH feed preview $LINT_OPTION -hm" 0

# Test 2: Advanced feed type validation
run_test_if_enabled 2 "Feed type parameter (asyncapi)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking'" 0

run_test_if_enabled 3 "Feed type parameter (restapi)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'restapi'" 1

# Test 4: Advanced feed view validation
run_test_if_enabled 4 "Feed view parameter (publisher)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-view 'publisher'" 1

# Test 5: Advanced file name validation
run_test_if_enabled 5 "Feed view parameter (provider)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-view 'provider'" 1

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 5 "File name parameter with valid extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test-asyncapi.json'" 1
else
    run_test_if_enabled 5 "File name parameter with valid extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test-asyncapi.json'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 5 "File name parameter with yaml extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test-asyncapi.yaml'" 1
else
    run_test_if_enabled 5 "File name parameter with yaml extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test-asyncapi.yaml'" 0
fi

# Test 6: Advanced community feed validation
run_test_if_enabled 6 "Community feed parameter (true)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --community-feed true" 0

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 6 "File name with feed type combination" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-type 'asyncapi'" 1
else
    run_test_if_enabled 6 "File name with feed type combination" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-type 'asyncapi'" 0
fi

# Test 7: Advanced parameter combinations - community feed with feed name
run_test_if_enabled 7 "Community feed parameter (false)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --community-feed false" 0

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 7 "Community feed with feed name combination" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'community-feed' --community-feed true" 1
else
    run_test_if_enabled 7 "Community feed with feed name combination" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'community-feed' --community-feed true" 0
fi

# Test 8: Advanced parameter combinations - feed view without file name
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 8 "Feed view without feed name (should work)" "node $CLI_PATH feed preview $LINT_OPTION --file-name "test.json" --feed-view 'publisher'" 1
else
    run_test_if_enabled 8 "Feed view without feed name (should work)" "node $CLI_PATH feed preview $LINT_OPTION --file-name "test.json" --feed-view 'publisher'" 0
fi

# Test 9: Advanced parameter combinations - all valid parameters
run_test_if_enabled 9 "All valid parameters combination" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'asyncapi' --community-feed true" 1

# Test 10: Advanced parameter combinations - file name with feed view
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 10 "File name with feed view combination" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-view 'provider'" 1
else
    run_test_if_enabled 10 "File name with feed view combination" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-view 'provider'" 0
fi

# Test 11: Invalid feed type parameter
run_test_if_enabled 11 "Invalid feed type parameter" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'invalid_type'" 1

# Test 12: Invalid feed view parameter
run_test_if_enabled 12 "Invalid feed view parameter" "node $CLI_PATH feed preview $LINT_OPTION --feed-view 'invalid_view'" 1

# Test 13: Invalid community feed parameter
run_test_if_enabled 13 "Invalid community feed parameter" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --community-feed 'invalid'" 0

# Test 14: Valid parameter combination - feed-view with feed-name
run_test_if_enabled 14 "Valid parameter combination (feed-view with feed-name)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-view 'publisher'" 1

# Test 15: Invalid file extension
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 15 "Invalid file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.txt'" 1
else
    run_test_if_enabled 15 "Invalid file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.txt'" 0
fi

# Test 16: Empty file name
run_test_if_enabled 16 "Empty file name" "node $CLI_PATH feed preview $LINT_OPTION --file-name" 1

# Test 17: Empty feed name
run_test_if_enabled 17 "Empty feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name" 1

# Test 18: Non-existent file
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 18 "Non-existent file" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'non-existent.json'" 1
else
    run_test_if_enabled 18 "Non-existent file" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'non-existent.json'" 0
fi

# Test 19: Non-existent community feed
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 19 "Non-existent community feed" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'non-existent-community-feed' --community-feed true" 1
else
    run_test_if_enabled 19 "Non-existent community feed" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'non-existent-community-feed' --community-feed true" 0
fi

# Test 20: Missing required parameters
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 20 "Missing required parameters (no feed-name or file-name)" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-type 'asyncapi'" 1
else
    run_test_if_enabled 20 "Missing required parameters (no feed-name or file-name)" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-type 'asyncapi'" 0
fi

# Test 21: Advanced short form parameters
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 21 "Advanced short form file name" "node $CLI_PATH feed preview $LINT_OPTION -file 'advanced-test.json'" 1
else
    run_test_if_enabled 21 "Advanced short form file name" "node $CLI_PATH feed preview $LINT_OPTION -file 'advanced-test.json'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 21 "Advanced short form feed name" "node $CLI_PATH feed preview $LINT_OPTION -feed 'Advanced Banking'" 1
else
    run_test_if_enabled 21 "Advanced short form feed name" "node $CLI_PATH feed preview $LINT_OPTION -feed 'Advanced Banking'" 0
fi

run_test_if_enabled 21 "Advanced short form feed type" "node $CLI_PATH feed preview $LINT_OPTION -feed 'Core Banking' -type 'restapi'" 1

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 21 "Advanced short form feed view" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-view 'provider'" 1
else
    run_test_if_enabled 21 "Advanced short form feed view" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'test.json' --feed-view 'provider'" 0
fi

run_test_if_enabled 21 "Advanced short form community feed" "node $CLI_PATH feed preview $LINT_OPTION -feed 'Core Banking' -community false" 0

# Test 22: Advanced custom feed type
run_test_if_enabled 22 "Advanced custom feed type" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'custom'" 1

# Test 23: Advanced default values testing
run_test_if_enabled 23 "Advanced feed type default behavior" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking'" 0

run_test_if_enabled 23 "Advanced community feed default behavior" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --community-feed true" 0

# Test 24: Advanced file extensions
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 24 "Advanced YAML file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.yaml'" 1
else
    run_test_if_enabled 24 "Advanced YAML file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.yaml'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
  run_test_if_enabled 24 "Advanced YML file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.yml'" 1
else
    run_test_if_enabled 24 "Advanced YML file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.yml'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 24 "Advanced JSON file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.json'" 1
else
    run_test_if_enabled 24 "Advanced JSON file extension" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced-test.json'" 0
fi

# Test 25: Advanced parameter combinations
run_test_if_enabled 25 "Advanced all parameters together" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Advanced Banking' --file-name 'advanced.json' --feed-type 'custom' --feed-view 'provider' --community-feed false" 1

run_test_if_enabled 25 "Advanced file name with community feed" "node $CLI_PATH feed preview $LINT_OPTION --file-name 'advanced.json' --community-feed false" 1

run_test_if_enabled 25 "Advanced feed name with custom type" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'custom'" 1

# Test 26: Advanced edge cases
if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 26 "Advanced very long feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'ThisIsAVeryLongFeedNameThatShouldBeTestedForEdgeCasesAndBoundaryConditions'" 1
else
    run_test_if_enabled 26 "Advanced very long feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'ThisIsAVeryLongFeedNameThatShouldBeTestedForEdgeCasesAndBoundaryConditions'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 26 "Advanced special characters in feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core-Banking_123'" 1
else
    run_test_if_enabled 26 "Advanced special characters in feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core-Banking_123'" 0
fi

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 26 "Advanced feed name with numbers" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Banking123'" 1
else
    run_test_if_enabled 26 "Advanced feed name with numbers" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Banking123'" 0
fi

# Test 27: Advanced invalid combinations
run_test_if_enabled 27 "Advanced feed name with file name (should be invalid)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --file-name 'test.json'" 1

run_test_if_enabled 27 "Advanced multiple feed types (should be invalid)" "node $CLI_PATH feed preview $LINT_OPTION --feed-name 'Core Banking' --feed-type 'asyncapi' --feed-type 'restapi'" 1

# Test 28: Advanced boundary testing
run_test_if_enabled 28 "Advanced empty string feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name" 1

run_test_if_enabled 28 "Advanced empty string file name" "node $CLI_PATH feed preview $LINT_OPTION --file-name" 1

if [ "${STM_TEST_EXECUTION:-0}" = "1" ]; then
    run_test_if_enabled 28 "Advanced whitespace only feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name '   '" 1
else
    run_test_if_enabled 28 "Advanced whitespace only feed name" "node $CLI_PATH feed preview $LINT_OPTION --feed-name '   '" 0
fi

# Generate test summary
generate_test_summary
