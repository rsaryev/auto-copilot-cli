#!/bin/bash
# Install Node.js version 18.16.0 if not already installed
if ! node -v | grep -q "^v18\."; then
  echo "🚀 Node.js is not installed. Installing Node.js..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  source ~/.nvm/nvm.sh
  nvm install v18.16.0
fi

if ! npm list -g | grep -q "auto-copilot-cli"; then
  echo "🚀 Node.js is installed. Installing auto-copilot-cli..."
  npm install -g auto-copilot-cli
fi

echo "🚀 auto-copilot-cli is installed. Running copilot --help"

