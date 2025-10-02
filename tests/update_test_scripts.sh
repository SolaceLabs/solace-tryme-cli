#!/bin/bash

# Script to update all remaining test scripts with the same improvements
# applied to the send command tests

echo "Updating all remaining test scripts..."

# List of test scripts to update (excluding send command tests which are already updated)
TEST_SCRIPTS=(
    "test_receive_advanced_parameters.sh"
    "test_request_basic_parameters.sh"
    "test_request_advanced_parameters.sh"
    "test_reply_basic_parameters.sh"
    "test_reply_advanced_parameters.sh"
    "test_feed_preview_basic_parameters.sh"
    "test_feed_preview_advanced_parameters.sh"
    "test_feed_generate_basic_parameters.sh"
    "test_feed_generate_advanced_parameters.sh"
    "test_feed_configure_basic_parameters.sh"
    "test_feed_configure_advanced_parameters.sh"
    "test_feed_run_basic_parameters.sh"
    "test_feed_run_advanced_parameters.sh"
    "test_feed_list_basic_parameters.sh"
    "test_feed_list_advanced_parameters.sh"
    "test_feed_import_basic_parameters.sh"
    "test_feed_import_advanced_parameters.sh"
    "test_feed_export_basic_parameters.sh"
    "test_feed_export_advanced_parameters.sh"
    "test_feed_contribute_basic_parameters.sh"
    "test_feed_contribute_advanced_parameters.sh"
    "test_feed_download_basic_parameters.sh"
    "test_feed_download_advanced_parameters.sh"
)

# Function to update a test script
update_test_script() {
    local script="$1"
    echo "Updating $script..."
    
    if [ ! -f "$script" ]; then
        echo "  Warning: $script not found, skipping..."
        return
    fi
    
    # 1. Remove set -e
    sed -i '' 's/^set -e/# set -e/' "$script"
    
    # 2. Update run_test function (this is complex, so we'll do it manually for each)
    echo "  Note: Manual update required for run_test function in $script"
    
    # 3. Update summary display format (this is also complex, manual update required)
    echo "  Note: Manual update required for summary display in $script"
    
    echo "  Basic updates applied to $script"
}

# Update each test script
for script in "${TEST_SCRIPTS[@]}"; do
    update_test_script "$script"
done

echo "Basic updates completed. Manual updates still required for:"
echo "1. run_test function improvements"
echo "2. Summary display format improvements"
echo "3. Adding expected result parameters to test calls"
echo "4. Adding timeout commands where needed"
echo "5. Reviewing and fixing invalid parameters"
