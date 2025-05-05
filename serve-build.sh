#!/bin/bash

# Check if serve is installed
if ! command -v npx serve &> /dev/null; then
  echo "Installing serve package..."
  npm install -g serve
fi

# Check if build directory exists
if [ ! -d "build" ]; then
  echo "Build directory not found. Running production build..."
  ./build.sh
fi

# Serve the build directory
echo "Starting local server for build preview..."
echo "Access your app at http://localhost:5000"
npx serve -s build 