#!/bin/bash
set -e

# Define variables
REPO_NAME="SolaceLabs/solace-tryme-cli"
TAP_NAME="SolaceLabs/homebrew-stm.git"
FORMULA_NAME="stm"

pkg_version=$1
if [ -z "$pkg_version" ]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

# Clone the Homebrew tap
git clone https://x-access-token:$GITHUB_TOKEN@github.com/$TAP_NAME

cd homebrew-$FORMULA_NAME

# Calculate SHA256 for both macOS archs
SHA256_X64=$(shasum -a 256 ../release/stm-macos-x64-v$pkg_version.zip | awk '{ print $1 }')
SHA256_ARM64=$(shasum -a 256 ../release/stm-macos-arm64-v$pkg_version.zip | awk '{ print $1 }')

# Regenerate the formula from scratch (idempotent, no reliance on prior file structure)
cat > Formula/$FORMULA_NAME.rb <<EOF
class Stm < Formula
  desc "This is a command line tool to help you get started with Solace PubSub+ Event Broker"
  homepage "https://github.com/$REPO_NAME"
  version "$pkg_version"
  license "Apache-2.0"

  on_macos do
    on_intel do
      url "https://github.com/$REPO_NAME/releases/download/v$pkg_version/stm-macos-x64-v$pkg_version.zip"
      sha256 "$SHA256_X64"

      def install
        bin.install "stm-macos-x64" => "stm"
      end
    end

    on_arm do
      url "https://github.com/$REPO_NAME/releases/download/v$pkg_version/stm-macos-arm64-v$pkg_version.zip"
      sha256 "$SHA256_ARM64"

      def install
        bin.install "stm-macos-arm64" => "stm"
      end
    end
  end

  test do
    system "#{bin}/stm", "--version"
  end
end
EOF

# Commit and push changes
git config --global user.email "community@solace.com"
git config --global user.name "SollyBot"
git add Formula/$FORMULA_NAME.rb
git commit -m "Update $FORMULA_NAME to $pkg_version" --allow-empty
git push

cd ..
