#!/bin/bash

#
# Usage: ./test_feed_configure_advanced_parameters.sh [START_TEST_NUMBER]
# Example: ./test_feed_configure_advanced_parameters.sh 10  # Start from test 10

# Test script for Feed Configure Command advanced parameters
#
# Usage: ./test_feed_configure_advanced_parameters.sh [START_TEST_NUMBER]
# Example: ./test_feed_configure_advanced_parameters.sh 10  # Start from test 10

# Tests: Advanced parameter validation and help output

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

echo -e "${CYAN}=== Feed Configure Command Advanced Parameters Test ===${NC}\n"

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
run_test_if_enabled 1 "Advanced help command" "node $CLI_PATH feed configure $LINT_OPTION -hm" 0

# Test 2: Advanced feed name validation
run_test_if_enabled 2 "Feed name parameter (valid)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'advanced-feed'" 0

run_test_if_enabled 2 "Feed name parameter (with special chars)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking-123'" 0

# Test 3: Advanced port validation
run_test_if_enabled 3 "Port parameter (valid range)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 8888" 0

run_test_if_enabled 3 "Port parameter (high port)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 65535" 0

run_test_if_enabled 3 "Port parameter (low port)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 1024" 0

# Test 4: Advanced parameter combinations
run_test_if_enabled 4 "Feed name with port combination" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'advanced-feed' --manage-port 9000" 0

run_test_if_enabled 4 "Short form parameters combination" "node $CLI_PATH feed configure $LINT_OPTION -feed 'Core Banking' -port 8888" 0

# Test 5: Advanced port edge cases
run_test_if_enabled 5 "Port parameter (zero - default)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 0" 0

run_test_if_enabled 5 "Port parameter (one)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 1" 0

run_test_if_enabled 5 "Port parameter (max valid)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 65535" 0

# Test 6: Advanced validation tests
run_test_if_enabled 6 "Invalid port parameter (negative)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port -1" 1

run_test_if_enabled 6 "Invalid port parameter (too high)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 99999" 0

run_test_if_enabled 6 "Invalid port parameter (non-numeric)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 'invalid'" 1

# Test 7: Advanced feed name validation
run_test_if_enabled 7 "Empty feed name" "node $CLI_PATH feed configure $LINT_OPTION --feed-name" 1

run_test_if_enabled 7 "Non-existent feed name" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'non-existent-advanced-feed'" 0

# Test 8: Advanced parameter combinations
run_test_if_enabled 8 "All valid parameters combination" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'comprehensive-feed' --manage-port 8888" 0

run_test_if_enabled 8 "Short form comprehensive test" "node $CLI_PATH feed configure $LINT_OPTION -feed 'short-feed' -port 3000" 0

# Test 9: Advanced edge cases
run_test_if_enabled 9 "Port parameter (boundary test)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 65534" 0

run_test_if_enabled 9 "Feed name with numbers" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'feed123'" 0

# Test 10: Advanced error handling
run_test_if_enabled 10 "Valid parameter combination (port only)" "node $CLI_PATH feed configure $LINT_OPTION --manage-port 8888" 0

run_test_if_enabled 10 "Invalid parameter combination (empty port)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port" 0

# Test 11: Comprehensive advanced parameters
run_test_if_enabled 11 "Comprehensive advanced parameters" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'advanced-comprehensive-feed' --manage-port 9000" 0

# Test 12: Advanced default values testing
run_test_if_enabled 12 "Advanced no parameters (should use defaults)" "node $CLI_PATH feed configure $LINT_OPTION" 0

run_test_if_enabled 12 "Advanced port default behavior" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking'" 0

# Test 13: Advanced port boundary testing
run_test_if_enabled 13 "Advanced port parameter (boundary low)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 1" 0

run_test_if_enabled 13 "Advanced port parameter (boundary high)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 65535" 0

run_test_if_enabled 13 "Advanced port parameter (boundary max-1)" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 65534" 0

# Test 14: Advanced feed name edge cases
run_test_if_enabled 14 "Advanced very long feed name" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'ThisIsAVeryLongFeedNameThatShouldBeTestedForEdgeCasesAndBoundaryConditions'" 0

run_test_if_enabled 14 "Advanced special characters in feed name" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core-Banking_123'" 0

run_test_if_enabled 14 "Advanced feed name with numbers" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Banking123'" 0

# Test 15: Advanced parameter combinations
run_test_if_enabled 15 "Advanced all parameters together" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 8888" 0

run_test_if_enabled 15 "Advanced short form all parameters" "node $CLI_PATH feed configure $LINT_OPTION -feed 'Core Banking' -port 8888" 0

# Test 16: Advanced edge cases
run_test_if_enabled 16 "Advanced whitespace only feed name" "node $CLI_PATH feed configure $LINT_OPTION --feed-name '   '" 0

run_test_if_enabled 16 "Advanced port with leading zeros" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 0080" 0

run_test_if_enabled 16 "Advanced port with decimal" "node $CLI_PATH feed configure $LINT_OPTION --feed-name 'Core Banking' --manage-port 8888.5" 1

# Generate test summary
generate_test_summary
