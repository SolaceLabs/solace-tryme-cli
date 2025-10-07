#!/bin/bash

# Master test runner for Solace Try-Me CLI Test Suite
# Runs all parameter validation test scripts (basic and advanced only)

# set -e  # Disabled to allow test scripts to fail without stopping the entire test suite

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Log file for capturing all output
LOG_FILE="all_feed_tests.log"

# Function to log and display output
log_and_display() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to log and display colored output (colored console, plain log)
log_and_display_colored() {
    # Display colored output to console
    echo -e "$1"
    # Strip ANSI color codes and write plain text to log file
    echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"
}

# Initialize log file with timestamp
echo "=== Solace Try-Me CLI Test Suite Execution ===" > "$LOG_FILE"
echo "Started at: $(date)" >> "$LOG_FILE"
echo "=============================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

log_and_display_colored "${CYAN}=== Solace Try-Me CLI Parameter Validation Test Suite ===${NC}"
log_and_display ""
log_and_display_colored "${WHITE}Total Test Scripts: 26${NC}"
log_and_display_colored "${WHITE}Commands Covered: 13 (4 messaging + 9 feed)${NC}"
log_and_display_colored "${WHITE}Test Types: 2 per command (basic, advanced)${NC}"
log_and_display ""

# Test categories
MESSAGING_COMMANDS=("send" "receive" "request" "reply")
FEED_COMMANDS=("preview" "generate" "configure" "run" "list" )
TEST_TYPES=("basic_parameters" "advanced_parameters")

# Test execution summary
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Function to run a test script
run_test_script() {
    local script_name="$1"
    local test_type="$2"
    local command="$3"
    
    log_and_display_colored "${YELLOW}Running: $script_name${NC}"
    log_and_display "Debug: Current directory: $(pwd)"
    log_and_display "Debug: Script exists: $([ -f "$script_name" ] && echo "YES" || echo "NO")"
    
    if [ -f "$script_name" ]; then
        # Log the start of the test script execution
        echo "" >> "$LOG_FILE"
        echo "=== Executing $script_name ===" >> "$LOG_FILE"
        echo "Started at: $(date)" >> "$LOG_FILE"
        echo "----------------------------------------" >> "$LOG_FILE"
        
        # Run the test script and capture all output to both console and log file
        # Use PIPEFAIL to ensure we capture the exit code correctly
        set -o pipefail
        if ./"$script_name" 2>&1 | tee >(sed 's/\x1b\[[0-9;]*m//g' >> "$LOG_FILE"); then
            log_and_display_colored "${GREEN}✓ $script_name PASSED${NC}"
            ((PASSED_TESTS++))
        else
            log_and_display_colored "${RED}✗ $script_name FAILED${NC}"
            ((FAILED_TESTS++))
        fi
        set +o pipefail
        
        # Log the end of the test script execution
        echo "----------------------------------------" >> "$LOG_FILE"
        echo "Completed at: $(date)" >> "$LOG_FILE"
        echo "=== End of $script_name ===" >> "$LOG_FILE"
        echo "" >> "$LOG_FILE"
    else
        log_and_display_colored "${YELLOW}⚠ $script_name SKIPPED (not found)${NC}"
        ((SKIPPED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

log_and_display_colored "${CYAN}=== Running Messaging Command Tests ===${NC}"

log_and_display ""
log_and_display_colored "${CYAN}=== Running Feed Command Tests ===${NC}"

# Run feed command tests
for command in "${FEED_COMMANDS[@]}"; do
    log_and_display ""
    log_and_display_colored "${WHITE}Testing feed $command command:${NC}"
    for test_type in "${TEST_TYPES[@]}"; do
        script_name="test_feed_${command}_${test_type}.sh"
        if [ -f "$script_name" ]; then
            run_test_script "$script_name" "$test_type" "feed $command"
        fi
    done
done

# Generate final summary
log_and_display ""
log_and_display_colored "${CYAN}=== FINAL TEST EXECUTION SUMMARY ===${NC}"
log_and_display_colored "${WHITE}Total Test Scripts: $TOTAL_TESTS${NC}"
log_and_display_colored "${GREEN}Passed: $PASSED_TESTS${NC}"
log_and_display_colored "${RED}Failed: $FAILED_TESTS${NC}"
log_and_display_colored "${YELLOW}Skipped: $SKIPPED_TESTS${NC}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    log_and_display_colored "${WHITE}Success Rate: $success_rate%${NC}"
fi

# Overall result
log_and_display ""
log_and_display_colored "${CYAN}=== OVERALL RESULT ===${NC}"
if [ $FAILED_TESTS -eq 0 ] && [ $SKIPPED_TESTS -eq 0 ]; then
    log_and_display_colored "${GREEN}🎉 ALL PARAMETER VALIDATION TESTS COMPLETED SUCCESSFULLY! 🎉${NC}"
    log_and_display_colored "${WHITE}The Solace Try-Me CLI parameter validation test suite is comprehensive and ready for use.${NC}"
    
    # Log completion timestamp
    echo "" >> "$LOG_FILE"
    echo "=== Test Suite Execution Completed Successfully ===" >> "$LOG_FILE"
    echo "Completed at: $(date)" >> "$LOG_FILE"
    echo "Total Tests: $TOTAL_TESTS" >> "$LOG_FILE"
    echo "Passed: $PASSED_TESTS" >> "$LOG_FILE"
    echo "Failed: $FAILED_TESTS" >> "$LOG_FILE"
    echo "Skipped: $SKIPPED_TESTS" >> "$LOG_FILE"
    echo "Success Rate: $success_rate%" >> "$LOG_FILE"
    
    log_and_display ""
    log_and_display_colored "${WHITE}📄 All test output has been captured in: $LOG_FILE${NC}"
    exit 0
elif [ $FAILED_TESTS -eq 0 ]; then
    log_and_display_colored "${YELLOW}⚠ ALL TESTS PASSED, BUT SOME WERE SKIPPED ⚠${NC}"
    log_and_display_colored "${WHITE}Please ensure all test scripts are present and executable.${NC}"
    
    # Log completion timestamp
    echo "" >> "$LOG_FILE"
    echo "=== Test Suite Execution Completed with Warnings ===" >> "$LOG_FILE"
    echo "Completed at: $(date)" >> "$LOG_FILE"
    echo "Total Tests: $TOTAL_TESTS" >> "$LOG_FILE"
    echo "Passed: $PASSED_TESTS" >> "$LOG_FILE"
    echo "Failed: $FAILED_TESTS" >> "$LOG_FILE"
    echo "Skipped: $SKIPPED_TESTS" >> "$LOG_FILE"
    
    log_and_display ""
    log_and_display_colored "${WHITE}📄 All test output has been captured in: $LOG_FILE${NC}"
    exit 1
else
    log_and_display_colored "${RED}❌ SOME TESTS FAILED ❌${NC}"
    log_and_display_colored "${WHITE}Please review the failed tests and fix any issues.${NC}"
    
    # Log completion timestamp
    echo "" >> "$LOG_FILE"
    echo "=== Test Suite Execution Completed with Failures ===" >> "$LOG_FILE"
    echo "Completed at: $(date)" >> "$LOG_FILE"
    echo "Total Tests: $TOTAL_TESTS" >> "$LOG_FILE"
    echo "Passed: $PASSED_TESTS" >> "$LOG_FILE"
    echo "Failed: $FAILED_TESTS" >> "$LOG_FILE"
    echo "Skipped: $SKIPPED_TESTS" >> "$LOG_FILE"
    
    log_and_display ""
    log_and_display_colored "${WHITE}📄 All test output has been captured in: $LOG_FILE${NC}"
    exit 1
fi
