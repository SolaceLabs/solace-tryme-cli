#!/bin/bash
set -e

# Define variables
REPO_NAME="SolaceLabs/solace-tryme-cli"
TAP_NAME="SolaceLabs/homebrew-stm.git"
FORMULA_NAME="stm"

# Clone the Homebrew tap
git clone https://x-access-token:$GITHUB_TOKEN@github.com/$TAP_NAME

cd homebrew-$FORMULA_NAME

# Update formula
pkg_version=$1
sed -i "s|url .*|url \"https://github.com/$REPO_NAME/releases/download/$pkg_version/stm-macos-v$pkg_version.zip\"|" Formula/$FORMULA_NAME.rb
sed -i "s|sha256 .*|sha256 \"$(shasum -a 256 ../release/stm-macos-v$pkg_version.zip | awk '{ print $1 }')\"|" Formula/$FORMULA_NAME.rb
# Commit and push changes
git config --global user.email "community@solace.com"
git config --global user.name "SollyBot"
git commit -am "Update $FORMULA_NAME to $pkg_version"
git push

cd ..
