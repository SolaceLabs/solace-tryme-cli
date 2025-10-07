#!/bin/bash

#
# Usage: ./test_send_advanced_parameters.sh [START_TEST_NUMBER]
# Example: ./test_send_advanced_parameters.sh 10  # Start from test 10

# Test script for send command advanced parameters
#
# Usage: ./test_send_advanced_parameters.sh [START_TEST_NUMBER]
# Example: ./test_send_advanced_parameters.sh 10  # Start from test 10

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

echo -e "${CYAN}=== Send Command Advanced Parameters Test ===${NC}\n"

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

# Test 1: Advanced help output
run_test_if_enabled 1 "Advanced help command" "node $CLI_PATH send $LINT_OPTION -hm" 0

# Test 2: Advanced message settings - payload type
run_test_if_enabled 2 "Payload type parameter (TEXT)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --payload-type TEXT --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 2 "Payload type parameter (BYTES)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --payload-type BYTES --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 3: Advanced message settings - delivery mode
run_test_if_enabled 3 "Delivery mode parameter (DIRECT)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --delivery-mode DIRECT --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 3 "Delivery mode parameter (PERSISTENT)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --delivery-mode PERSISTENT --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 4: Advanced message settings - time to live
run_test_if_enabled 4 "Time to live parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --time-to-live 30000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 5: Advanced message settings - DMQ eligible
run_test_if_enabled 5 "DMQ eligible parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --dmq-eligible true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 5 "DMQ eligible parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --dmq-eligible false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 6: Advanced message settings - eliding eligible (REMOVED - parameter doesn't exist)
# run_test_if_enabled 6 "Eliding eligible parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --eliding-enabled true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0
# run_test_if_enabled 6 "Eliding eligible parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --eliding-enabled false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 7: Advanced message settings - application message ID
run_test_if_enabled 7 "Application message ID parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --app-message-id 'test-msg-123' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 8: Advanced message settings - application message type
run_test_if_enabled 8 "Application message type parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --app-message-type 'test-type' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 9: Advanced message settings - correlation ID (REMOVED - parameter is commented out)
# run_test_if_enabled 9 "Correlation ID parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --correlation-id 'corr-123' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 10: Advanced message settings - reply to topic
run_test_if_enabled 10 "Reply to topic parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --reply-to-topic 'test/reply' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 11: Advanced message settings - user properties
run_test_if_enabled 11 "User properties parameter (single)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --user-properties 'key1:value1' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 11 "User properties parameter (multiple)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --user-properties 'key1:value1' 'key2:value2' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 12: Advanced message settings - HTTP content type
run_test_if_enabled 12 "HTTP content type parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --http-content-type 'application/json' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 13: Advanced message settings - HTTP content encoding
run_test_if_enabled 13 "HTTP content encoding parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --http-content-encoding 'gzip' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 14: Advanced session settings - client name
run_test_if_enabled 14 "Client name parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --client-name 'test-client' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 15: Advanced session settings - description
run_test_if_enabled 15 "Description parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --description 'Test application' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 16: Advanced session settings - read timeout
run_test_if_enabled 16 "Read timeout parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --read-timeout 15000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 17: Advanced session settings - connection timeout
run_test_if_enabled 17 "Connection timeout parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --connection-timeout 5000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 18: Advanced session settings - connection retries
run_test_if_enabled 18 "Connection retries parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --connection-retries 5 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 19: Advanced session settings - reconnect retries
run_test_if_enabled 19 "Reconnect retries parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --reconnect-retries 5 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 20: Advanced session settings - reconnect retry wait
run_test_if_enabled 20 "Reconnect retry wait parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --reconnect-retry-wait 5000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 21: Advanced session settings - include sender ID
run_test_if_enabled 21 "Include sender ID parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --include-sender-id true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 21 "Include sender ID parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --include-sender-id false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 22: Advanced session settings - generate sequence number
run_test_if_enabled 22 "Generate sequence number parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --generate-sequence-number true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 22 "Generate sequence number parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --generate-sequence-number false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 23: Advanced session settings - log level
run_test_if_enabled 23 "Log level parameter (DEBUG)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --log-level DEBUG --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 23 "Log level parameter (INFO)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --log-level INFO --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 24: Advanced publish settings - publish confirmation
run_test_if_enabled 24 "Publish confirmation parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --publish-confirmation true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 24 "Publish confirmation parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --publish-confirmation false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 25: Advanced publish settings - send timestamps
run_test_if_enabled 25 "Send timestamps parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --send-timestamps true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 25 "Send timestamps parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --send-timestamps false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 26: Advanced publish settings - send buffer max size
run_test_if_enabled 26 "Send buffer max size parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --send-buffer-max-size 131072 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 27: Comprehensive advanced parameters combination
run_test_if_enabled 27 "Comprehensive advanced parameters combination" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --payload-type TEXT --delivery-mode PERSISTENT --time-to-live 30000 --dmq-eligible false --app-message-type 'comprehensive-test' --user-properties 'testKey:testValue' --client-name 'advanced-client' --log-level INFO --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 28: Invalid payload type parameter
run_test_if_enabled 28 "Invalid payload type parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --payload-type INVALID --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 29: Invalid delivery mode parameter
run_test_if_enabled 29 "Invalid delivery mode parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --delivery-mode INVALID --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 30: Invalid log level parameter
run_test_if_enabled 30 "Invalid log level parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --log-level INVALID --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 31: Invalid time-to-live parameter (negative value)
run_test_if_enabled 31 "Invalid time-to-live parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --time-to-live -1000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 32: Invalid read-timeout parameter (negative value)
run_test_if_enabled 32 "Invalid read-timeout parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --read-timeout -1000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 33: Invalid connection-timeout parameter (negative value)
run_test_if_enabled 33 "Invalid connection-timeout parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --connection-timeout -1000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 34: Invalid connection-retries parameter (negative value)
run_test_if_enabled 34 "Invalid connection-retries parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --connection-retries -1 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 35: Invalid send-buffer-max-size parameter (negative value)
run_test_if_enabled 35 "Invalid send-buffer-max-size parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --send-buffer-max-size -1000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 36: Invalid user properties format
run_test_if_enabled 36 "Invalid user properties format" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --user-properties 'invalid-format' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 37: Partition key settings - partition keys count
run_test_if_enabled 37 "Partition keys count parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --partition-keys-count 5 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 38: Partition key settings - partition keys list
run_test_if_enabled 38 "Partition keys list parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --partition-keys-list 'RED' 'GREEN' 'BLUE' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 39: Partition key settings - partition keys conflicts
run_test_if_enabled 39 "Partition keys conflicts" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --partition-keys-count 5 --partition-keys-list 'RED' 'GREEN' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 1

# Test 40: Advanced help examples
run_test_if_enabled 40 "Advanced help examples" "node $CLI_PATH send $LINT_OPTION -he" 0

# Test 41: Missing supported parameters - client name (short form)
run_test_if_enabled 41 "Client name parameter (short form)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' -cn 'test-client-short' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 42: Missing supported parameters - time to live (short form)
run_test_if_enabled 42 "Time to live parameter (short form)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' -ttl 15000 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 43: Missing supported parameters - DMQ eligible (short form)
run_test_if_enabled 43 "DMQ eligible parameter (short form)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' -dmq true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 44: Missing supported parameters - partition keys
run_test_if_enabled 44 "Partition keys parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --partition-keys 'firstName | lastName' --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 45: Missing supported parameters - acknowledge mode
run_test_if_enabled 45 "Acknowledge mode parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --acknowledge-mode PER_MESSAGE --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 46: Missing supported parameters - acknowledge immediately
run_test_if_enabled 46 "Acknowledge immediately parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --acknowledge-immediately true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 47: Missing supported parameters - window size
run_test_if_enabled 47 "Window size parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --window-size 100 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 48: Missing supported parameters - wait before exit
run_test_if_enabled 48 "Wait before exit parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --wait-before-exit 5 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 49: Missing supported parameters - exit after
run_test_if_enabled 49 "Exit after parameter" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --exit-after 10 --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Test 50: Missing supported parameters - trace visualization
run_test_if_enabled 50 "Trace visualization parameter (true)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --trace-visualization true --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

run_test_if_enabled 50 "Trace visualization parameter (false)" "node $CLI_PATH send $LINT_OPTION --topic 'test/topic' --message 'test' --trace-visualization false --count 1 --url ws://localhost:8008 --vpn default --username default --password default" 0

# Generate test summary
generate_test_summary
